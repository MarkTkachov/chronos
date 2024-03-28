const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const getSecret = require('../config/getSecret');
const User = require('../models/User');
const Event = require('../models/Event');
const Calendar = require('../models/Calendar');
const sendEmail = require('../utils/email/sendEmail');
const generateTokensAndSetCookies = require('../utils/tokens/tokenUtils');
const generateToken = require('../utils/tokens/generateToken');
const generateAccessTokensAndSetCookie = require('../utils/tokens/createAccessToken');
const { sendError, sendSuccess } = require('../utils/error/responseHelpers');
const isValidEmail = require('../utils/regexEmail');

const controllerAuthentication = {
  async register(req, res) {
    try {
      const {login, email, password } = req.body;
  
      if (await User.findOne({ $or: [{ login }, { email }] })) 
        return sendError(res, 400, 'A user with that login or email already exists.');
      
      if (!isValidEmail(email)) return sendError(res, 400, 'Invalid email format.');

      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        login, email,
        password: hashPassword
      });
      await newUser.save();

      const emailVerificationToken = await generateToken('verifyOrReset', {userId: newUser._id.toString()});
      newUser.emailVerificationToken = emailVerificationToken;
      await newUser.save();

      await Event.updateMany(
        {'participants.emailParticipant': email},
        {'$set': {'participants.$.userId': newUser._id}}
      );

      await Calendar.updateMany(
        { 'participants.emailParticipant': email, 'participants.accepted': true },
        { '$set': { 'participants.$.userId': newUser._id } }
      );
      
      const defaultCalendar = await Calendar.create({
        title: 'My Prime Calendar',
        type: 'local',
        creator: newUser._id,
        isDefault: true 
      });

      const sharedEvents = await Event.find({ 'participants.emailParticipant': email });
        
      if (sharedEvents.length > 0) {
        const eventIds = sharedEvents.map(event => event._id);
        await Calendar.findByIdAndUpdate(defaultCalendar._id, {
          $push: { events: { $each: eventIds } }
        });
      }
    
      await sendEmail(email, 'verifyEmail', emailVerificationToken);
      sendSuccess(res, 'User successfully registered.');
    } catch (error) {
      sendError(res, 500, 'Registration failed.', error.toString());
    }
  },

  async verifyEmail(req, res) {
    try {
      const {token} = req.query;
      const decoded = jwt.verify(token, await getSecret(1));

      const user = await User.findOne({
        _id: decoded.userId, 
        emailVerificationToken: token
      });

      if (!user) return sendError(res, 404, 'User not found');

      if (user.emailVerified) return sendError(res, 400, 'Email is already verified.');

      await generateTokensAndSetCookies(user, res);

      user.emailVerified = true;
      user.emailVerificationToken = '';
      await user.save();

      res.redirect(`${process.env.FRONTEND_URL}/login`)
    } catch (error) {
      sendError(res, 500, 'Email confirmation failed.', error.toString());
    }
  },

  async updateAccessToken(req, res) {
    try {
      const {refreshToken} = req.cookies;
      if(!refreshToken) return sendError(res, 401, 'Refresh token is required.');

      const decoded = jwt.verify(refreshToken, await getSecret(1));
      const user = await User.findById(decoded.userId);
      const tokenExists = user.refreshTokens.find(i => i.token === refreshToken && new Date(i.expiresAt) > new Date());

      if(!tokenExists) return sendError(res, 401, 'Invalid or expired refresh token.');

      await generateAccessTokensAndSetCookie({userId: user._id.toString()}, res);

      sendSuccess(res, 'Updated access token successfully.');
    } catch (error) {
      sendError(res, 401, 'Invalid or expired refresh token.', error.toString());
    }
  },

  async login(req, res) {
    try {
      const {loginOrEmail, password} = req.body;
      if (!loginOrEmail || !password) return sendError(res, 400, 'Please enter all fields.');

      if (loginOrEmail.includes('@') && !isValidEmail(loginOrEmail))
        return sendError(res, 400, 'Invalid email format.');

      const user = await User.findOne({
        $or: [{email: loginOrEmail}, {login: loginOrEmail}]
      }); 
      
      const isMatch = user && await bcrypt.compare(password, user.password);
      if(!user || !isMatch) return sendError(res, 404, 'Incorrect login/email or password.');
      await generateTokensAndSetCookies(user, res);

      const userData = {
        login: user.login,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture ? `${process.env.URL}/${user.profilePicture}` : null,
        emailVerified: user.emailVerified
      }

      sendSuccess(res, 'Login successfully.', userData);
    } catch (error) {
      sendError(res, 500, 'Login failed.', error.toString());
    }
  },

  async requestPasswordReset(req, res) {
    try {
      const {email} = req.body;
      if (!email) return sendError(res, 400, 'Email field is required.');

      if (!isValidEmail(email)) 
        return sendError(res, 400, 'Invalid email format.');

      const user = await User.findOne({ email });

      if (!user) return sendError(res, 404, 'An account with the specified email address does not exist.');

      const resetToken = await generateToken('verifyOrReset', {userId: user._id.toString()});
      console.log(resetToken);
      user.passwordResetToken = resetToken;
      await user.save();
      console.log(email)
      await sendEmail(email, 'resetPassword', resetToken);

      sendSuccess(res, 'Send email for reset password successfully.');
    } catch(error) {
      sendError(res, 500, 'Request password reset failed', error.toString());
    }
  },

  async resetPassword(req, res) {
    try {
      const {token} = req.query;
      const {newPassword, confirmPassword} = req.body;
      if (newPassword !== confirmPassword) return sendError(res, 400, 'Passwords do not match.');

      const decoded = jwt.verify(token, await getSecret(1));
      const user = await User.findOne({
        _id: decoded.userId, 
        passwordResetToken: token
      });

      if (!user) return sendError(res, 404, 'User not found');

      user.password = await bcrypt.hash(newPassword, 10);
      user.passwordResetToken = '';
      await user.save();

      sendSuccess(res, 'Password has been reset successfully');
    } catch(error) {
      sendError(res, 401, 'Invalid or expired token.', error.toString());
    }
  }, 

  async logout(req, res) {
    try {
      const {refreshToken} = req.cookies;
      if (!refreshToken) return sendError(res, 401, 'Refresh token is required.');

      const decoded = jwt.verify(refreshToken, await getSecret(1));
      const userId = decoded.userId;

      const user = await User.findById(userId)
      if(!user) return sendError(res, 404, 'User not found');

      const tokenIndex = user.refreshTokens.findIndex(i => i.token === refreshToken);
      if (tokenIndex === -1) return sendError(res, 401, 'Invalid refresh token.');

      await User.updateOne(
        { _id: userId},
        {$pull: {refreshTokens: {token: refreshToken}}}
      );

      res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'None' });
      res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'None' });

      sendSuccess(res, 'Logged out successfully');
    } catch(error) {
      sendError(res, 500, 'Logout failed', error.toString());
    }
  },

  async getUserByAccessToken(req, res) {
    try {
      const {accessToken} = req.cookies;
      if (!accessToken) return sendError(res, 401, 'Access token is required.');

      const decoded = jwt.verify(accessToken, await getSecret(1));
      const user = await User.findById(decoded.userId)
      .select('-_id -password -createdAt -updatedAt -emailVerificationToken -passwordResetToken -refreshTokens -__v');

      if (!user) return sendError(res, 404, 'User not found');

      const userData = {
        login: user.login,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture ? `${process.env.URL}/${user.profilePicture}` : null,
        emailVerified: user.emailVerified
      };

      sendSuccess(res, 'User data retrieved successfully.', userData);
    } catch(error) {
      sendError(res, 500, 'Failed to retrieve user data.', error.toString());
    }
  }
};

module.exports = controllerAuthentication;