const {sendError} = require('../../error/responseHelpers');

async function validateUserPermissions(userId, event, user, res) {
  if (!event.calendar.creator.equals(userId) && !event.creator.equals(userId))
    return sendError(res, 403, 'You do not have sufficient permissions to perform this action. Only the creator of the calendar and the event can share it');
  
  if (!user.emailVerified) 
    return sendError(res, 403, 'Email must be verified');

  if (user.hiddenCalendars.some(hiddenCalendarId => hiddenCalendarId.equals(event.calendar._id)))
    return sendError(res, 403, 'Cannot perform this action on an event in a hidden calendar.');
};

module.exports = validateUserPermissions;