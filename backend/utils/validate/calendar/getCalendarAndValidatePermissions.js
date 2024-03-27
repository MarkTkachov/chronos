const Calendar = require('../../../models/Calendar');
const mongoose = require('mongoose');
const { sendError } = require('../../error/responseHelpers');


async function getCalendarAndValidatePermissions(calendarId, userId, res) {
  if (!mongoose.Types.ObjectId.isValid(calendarId))
    return sendError(res, 400, 'Invalid calendar ID.');

  const calendar = await Calendar.findById(calendarId).populate('creator', 'email');
  if (!calendar)
    return sendError(res, 404, 'Calendar not found.');


  if (!calendar.creator.equals(userId))
    return sendError(res, 403, 'Only the creator can share the calendar.');

  return calendar;
};

module.exports = getCalendarAndValidatePermissions;