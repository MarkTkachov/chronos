const calculateMillisecondsToNextMonth = require('../time/timeUtils');
const generateToken = require('./generateToken');
const generateAccessTokensAndSetCookie = require('./createAccessToken');

async function generateTokensAndSetCookies(user, res) {
  const refreshToken = await generateToken('refreshToken', {userId: user._id.toString()});
  const refreshExp = new Date();
  refreshExp.setDate(refreshExp.getDate() + 7)
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: refreshExp
  });
  await user.save();
  
  await generateAccessTokensAndSetCookie({userId: user._id.toString()}, res);

  const maxAge = await calculateMillisecondsToNextMonth();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None', 
    maxAge: maxAge // 1month
  }); 
};


module.exports = generateTokensAndSetCookies;