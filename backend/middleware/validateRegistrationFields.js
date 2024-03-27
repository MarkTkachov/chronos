const { sendError } = require('../utils/error/responseHelpers');

const validateRegistrationFields = async (req, res, next) => {
  const {login, email, password, confirmPassword } = req.body;
  const statusCode = 400;

  if (!login || !email || !password || !confirmPassword) 
    return sendError(res, statusCode, 'Please enter all fields.');

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) 
    return sendError(res, statusCode, 'Invalid email format.');
      
  const passwordRegex = /^.{8,}$/;

  if (!passwordRegex.test(password) || !passwordRegex.test(confirmPassword)) 
    return sendError(res, statusCode, 'Password must be at least 8 characters long.');

  if (password !== confirmPassword) 
    return sendError(res, statusCode, 'Passwords do not match.');

  next();
}

module.exports = validateRegistrationFields;