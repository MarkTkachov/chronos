const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getSecret = require('../config/getSecret');
const generateAccessTokensAndSetCookie = require('../utils/tokens/createAccessToken');
const { sendError } = require('../utils/error/responseHelpers');

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies['accessToken'];
    if (!token) return sendError(res, 401, 'Access token is required.');

    const decoded = jwt.verify(token, await getSecret(1));
    const userId = decoded.userId;

    const userExists = await User.findById(userId);
    if (!userExists) return sendError(res, 404, 'User not found');

    await generateAccessTokensAndSetCookie({userId: userId}, res);

    req.userId = userId;
    next();
  } catch(err) {
    sendError(res, 401, 'Invalid or expired token.', err.toString());
  }
}

module.exports = authenticateToken;