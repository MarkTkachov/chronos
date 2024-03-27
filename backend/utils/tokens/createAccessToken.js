const generateToken = require('./generateToken');

async function generateAccessTokensAndSetCookie(payload, res) {
  const accessToken = await generateToken('accessToken', payload);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None', 
    maxAge: 15 * 60 * 1000 // 15m
  }); 
};

module.exports = generateAccessTokensAndSetCookie;