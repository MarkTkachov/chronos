const mongoose = require('mongoose');
const Calendar = require('../../../models/Calendar');
const User = require('../../../models/User');
const { sendError } = require('../../error/responseHelpers');

async function validateCalendarExists(calendarId, userId, res) {
  if (!mongoose.Types.ObjectId.isValid(calendarId)) 
    return sendError(res, 400, 'Invalid calendar ID.');

  const calendar = await Calendar.findById(calendarId);
  if (!calendar)
    return sendError(res, 404, 'Calendar not found.');
  
  if (!calendar.creator.equals(userId))
    return sendError(res, 403, 'Only the creator can perform this action.');

  return calendar;
}

async function validateUserPermissions(userId, res) {
  const user = await User.findById(userId);
  if (!user) 
    return sendError(res, 404, 'User not found.');

  if (!user.emailVerified) 
    return sendError(res, 403, 'User email is not verified.');

  return user;
}

module.exports = { validateCalendarExists, validateUserPermissions };
