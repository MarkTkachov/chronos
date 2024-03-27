const jwt = require('jsonwebtoken');
const getSecret = require('../../config/getSecret');
const calculateMillisecondsToNextMonth = require('../time/timeUtils');

async function generateToken(type, payload) {
  const jwtSecret = await getSecret(1);
  let expiresIn;
  switch(type) {
    case 'verifyOrReset':
      expiresIn = '10m';
      break;
    case 'accessToken':
      expiresIn = '15m';
      break;
    case 'refreshToken':
      expiresIn = Math.floor(await calculateMillisecondsToNextMonth() / 1000);
      break;
    case 'ical':
      expiresIn = '36500d';
      break;
    case 'invitation':
      expiresIn = '1d';
      break;
  }
  const token = jwt.sign(payload, jwtSecret, { expiresIn});
  return token;
};


module.exports = generateToken;