const User = require('../models/User');
const Calendar = require('../models/Calendar');
const Event = require('../models/Event');
const {sendError, sendSuccess} = require('../utils/error/responseHelpers');
const sendEmail = require('../utils/email/sendEmail');
const generateToken = require('../utils/tokens/generateToken');
const bcrypt = require('bcrypt');

const controllerUser = {
  async editUser(req, res) {
    try {
      const userId = req.userId;
      const { login, email } = req.body;

      const user = await User.findById(userId);
      if (!user) return sendError(res, 404, 'User not found');

      if (login) {
        const loginExists = await User.findOne({ login, _id: { $ne: userId } });
        if (loginExists)
          return sendError(res, 400, 'This login is already taken.');
        user.login = login;
      }

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) 
          return sendError(res, 400, 'This email is already registered.');
  
        user.email = email;

        const emailVerificationToken = await generateToken('verifyOrReset', { userId: user._id });
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerified = false;
        await sendEmail(email, 'verifyEmail', emailVerificationToken);
      }

      if (req.file) {
        if (user.profilePicture) {
          try {
            await fs.unlink(user.profilePicture);
          } catch (fsError) {
            console.error(`Failed to delete old profile picture: ${fsError.message}`);
          }
        }
        user.profilePicture = req.file.path;
      }

      await user.save();
      sendSuccess(res, 'User updated successfully.');
    } catch (error) {
      sendError(res, 500, 'Error updating user.', error.toString());
    }
  },

  async deleteUser(req, res) {
    try {
      const userId = req.userId; 
      const calendars = await Calendar.find({ creator: userId });
      const calendarIds = calendars.map(calendar => calendar._id);
      await Event.deleteMany({ calendar: { $in: calendarIds } });

      await Calendar.deleteMany({ creator: userId });

      await User.findByIdAndDelete(userId);

      return  sendSuccess(res, 'User and all associated calendars and events have been deleted.');
    } catch (error) {
      return sendError(res, 500, 'Error deleting user and associated data.', error.toString());
    } 
  },

  async  requestEmailVerification(req, res) {
    try {
      const userId = req.userId; 

      const user = await User.findById(userId);
  
      if (!user) return sendError(res, 404, 'User not found.');
  
      if (user.emailVerified) 
        return sendError(res, 400, 'Email is already verified.');

      const emailVerificationToken = await generateToken('verifyOrReset', {userId: user._id.toString()});
      user.emailVerificationToken = emailVerificationToken;
      user.emailVerified = false; 
      await user.save();

      await sendEmail(user.email, 'verifyEmail', emailVerificationToken);
      return sendSuccess(res, 'Verification email has been sent.');
    } catch (error) {
      return sendError(res, 500, 'Error sending verification email.', error.toString());
    }
  },

  async changePassword(req, res) {
    try {
      const userId = req.userId; 
      const { newPassword, confirmPassword } = req.body;

      if (!confirmPassword || !newPassword) 
        return sendError(res, 400, 'Please provide both new and confirm password.');

      const user = await User.findById(userId);
      if (!user) return sendError(res, 400, 'User not found.');

      const passwordRegex = /^.{8,}$/;
      
      if (!passwordRegex.test(newPassword) || !passwordRegex.test(confirmPassword)) 
        return sendError(res, statusCode, 'Password must be at least 8 characters long.');

      if (newPassword !== confirmPassword) 
        return sendError(res, statusCode, 'Passwords do not match.');
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return sendSuccess(res, 'Password has been changed successfully.');
    } catch (error) {
      return sendError(res, 500, 'Error changing password.', error.toString());
    }
  }
}

module.exports = controllerUser;