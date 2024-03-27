const Event = require('../../../models/Event');
const {sendError} = require('../../error/responseHelpers');
const mongoose = require('mongoose');

async function validateEvent(eventId, res) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) 
    return sendError(res, 400, 'Invalid event ID.');
  
  const event = await Event.findById(eventId).populate({
    path: 'calendar',
    populate: {
      path: 'participants.userId',
    },
  });

  if (!event || !event.calendar)
    return sendError(res, 404, 'Event or Calendar not found');

  return event;
};

module.exports = validateEvent;