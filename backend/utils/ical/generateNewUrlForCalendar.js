const generateToken = require('../tokens/generateToken');
const {encrypt} = require('../encryption/encryptionAES');

async function generateNewUrlForCalendar(type, calendar, userId='') {
  let returnUrl;
  switch(type) {
    case 'export':
      const tokenICal = await generateToken('ical', {userId: userId});
      const encrypted = await encrypt(tokenICal);
      returnUrl = `${process.env.URL}/api/calendar/${calendar._id}/events/export?private=${encodeURIComponent(encrypted)}`;
      break;
    case 'local':
      returnUrl = `${process.env.URL}/api/calendar/${calendar._id}/events`;
      break;
  }
  return returnUrl;
}

module.exports = generateNewUrlForCalendar;