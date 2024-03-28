const Calendar = require('../../../models/Calendar');
const Event = require('../../../models/Event');
const User = require('../../../models/User');
const mongoose = require('mongoose');
const { sendError, sendSuccess } = require('../../error/responseHelpers');


async function deleteCalendarForCreator(calendarId, res) {
  try {
    await Event.deleteMany({ calendar: calendarId });
    await Calendar.findByIdAndDelete(calendarId);
    return sendSuccess(res, 'Calendar deleted successfully.');
  } catch (error) {
    return sendError(res, 500, 'Failed to delete calendar.', error.toString());
  }
}

async function hideCalendarForCreator(calendarId, userId, res) {
  try {
    await User.findByIdAndUpdate(userId, { $addToSet: { hiddenCalendars: calendarId } });
    return sendSuccess(res, 'Calendar has been hidden for you.');
  } catch (error) {
    return sendError(res, 500, 'Failed to hide calendar.', error.toString());
  }
}

async function deleteCalendarForParticipant(calendarId, userId, res) {
  const isParticipant = (await Calendar.findById(calendarId)).participants.some(participant => 
    participant.userId && participant.userId.equals(userId));
  if (!isParticipant) 
    return sendError(res, 403, 'You are not a participant of this calendar.');
  
  const result = await Calendar.updateOne({ _id: calendarId }, { $pull: { participants: {userId: mongoose.Types.ObjectId(userId) } } });
  if (result.nModified > 0) 
    return sendSuccess(res, 'You have been removed from the calendar.');
  else 
    return sendError(res, 500, 'An error occurred while removing you from the calendar.');
}

async function handleCalendarDeletion(calendarId, userId, deleteForAll, res) {
  const calendar = await Calendar.findById(calendarId);
  if (!calendar) return sendError(res, 404, 'Calendar not found.');

  if (calendar.creator && calendar.creator.equals(userId)) {
    if (deleteForAll || (!deleteForAll && calendar.participants.length === 0)) 
      return await deleteCalendarForCreator(calendarId, res);
    else 
      return await hideCalendarForCreator(calendarId, userId, res);

  } else return await deleteCalendarForParticipant(calendarId, userId, res);
}

module.exports = { handleCalendarDeletion };
