const { sendError } = require('../../error/responseHelpers');

function validateParticipantsArray(participantsArray, res) {
  if (!participantsArray || !Array.isArray(participantsArray) || participantsArray.length === 0) {
    sendError(res, 400, 'Participants are required and should be an array.');
    return false;
  }
  return true;
};

module.exports = validateParticipantsArray;