const jwt = require('jsonwebtoken');
const Calendar = require('../models/Calendar');
const createICal = require('../utils/ical/createICal');
const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');
const {sendError, sendSuccess} = require('../utils/error/responseHelpers');
const getSecret = require('../config/getSecret');
const {decrypt} = require('../utils/encryption/encryptionAES');
const shareEventWithParticipants = require('../controllers/controllerShareEvent');

const controllerEvent = {
  async getEventsByCalendarId(req, res) {
    try {
      const { calendarId } = req.params;
      const {private} = req.query;
      
      if (!mongoose.Types.ObjectId.isValid(calendarId)) 
        return sendError(res, 400, 'Invalid calendar ID.');
    
      let userId;

      if(private) {
        const decrypted = await decrypt(decodeURIComponent(private));
        try {
          const decoded = jwt.verify(decrypted, await getSecret(1));
          userId = decoded.userId; 
        } catch (error) {
          return sendError(res, 401, 'Invalid token provided.');
        }
      } else userId = req.userId
      
      if (!userId) return sendError(res, 401, 'User authentication required.');

      const userExists = await User.findById(userId);
      if (!userExists) return sendError(res, 404, 'User not found');

      const calendar = await Calendar.findOne({
        _id: calendarId, 
        $or: [
          { creator: userId },
          { 'participants.userId': userId }
        ]
      });
      
      if (!calendar) 
        return sendError(res, 403, 'Access to the calendar events is denied.', '');

      let events;
      if (calendar.isDefault) events = await Event.find({ _id: { $in: calendar.events } });
      else events = await Event.find({ calendar: calendarId });
      
      const icalData = await createICal(events);
      res.setHeader('content-type', 'text/calendar');
      res.send(icalData);
    } catch(err) {
      sendError(res, 500, 'Server error occurred.', err.toString());
    }
  },

  async createEvent(req, res) {
    try {
      const { calendarId } = req.params;
      const { title, startDateTime, endDateTime, description, url, location, allDay, participants } = req.body;
      const userId = req.userId;
      if (!mongoose.Types.ObjectId.isValid(calendarId)) 
        return sendError(res, 400, 'Invalid calendar ID.');
    
      const user = await User.findById(userId);
      if (user.hiddenCalendars.some(hiddenCalendarId => hiddenCalendarId.equals(calendarId))) 
        return sendError(res, 403, 'Cannot create an event in a hidden calendar.');

      if (!title || !startDateTime || !endDateTime) 
        return sendError(res, 400, 'Title, start date time, and end date time are required.');

      const calendar = await Calendar.findById(calendarId);
      if (!calendar) return sendError(res, 404, 'Calendar not found.');
      
      if (!calendar.creator.equals(userId)) 
        return sendError(res, 403, 'Only the creator of the calendar can add events.');

      const newEvent = new Event({
        calendar: calendarId,
        title,
        description,
        url,
        startDateTime,
        endDateTime,
        location,
        allDay,
        creator: userId
      });
        
      await newEvent.save();
      // calendar.events.push(newEvent._id); 
      // await calendar.save();
      if (calendar.creator.equals(userId) && participants && Array.isArray(participants) && participants.length > 0) {
        try {
          await shareEventWithParticipants({
            params: { calendarId: calendarId, eventId: newEvent._id },
            body: { emails: participants },
            userId: userId 
          }, res);
          return;
        } catch(error) {
          return;
        }
      }
      return sendSuccess(res, 'Event created successfully.');
    } catch (error) {
      return sendError(res, 500, 'Server error occurred while creating an event.', error.toString());
    }
  },

  async editEvent(req, res) {
    try {
      const { eventId } = req.params;
      const { title, startDateTime, endDateTime, description, url, location, allDay, participants } = req.body;
      const userId = req.userId;

      if (!mongoose.Types.ObjectId.isValid(eventId)) 
        return sendError(res, 400, 'Invalid event ID.');

      const user = await User.findById(userId);
      if (!user) return sendError(res, 404, 'User not found.');
      
      const event = await Event.findById(eventId).populate('calendar');
      if (!event) return sendError(res, 404, 'Event not found.');

      const calendarId = event.calendar ? event.calendar._id : null;
      if (!calendarId) return sendError(res, 404, 'Calendar not found for this event.');

      if (user.hiddenCalendars.some(hiddenCalendarId => hiddenCalendarId.equals(calendarId))) 
        return sendError(res, 403, 'Cannot edit an event in a hidden calendar.');

      const calendar = await Calendar.findById(calendarId).populate('participants.userId');
      const isCreator = calendar && calendar.creator.equals(userId);
      const isEditor = calendar && calendar.participants.some(participant => 
        participant.userId && participant.userId._id.equals(userId) && participant.role === 'editor'
      );

      if (!isCreator && !isEditor) 
        return sendError(res, 403, 'Only the creator of the calendar or an editor can edit events.');


      if (isEditor && participants) 
        return sendError(res, 403, 'Only the creator of the calendar can edit participants.');

      event.title = title ?? event.title;
      event.startDateTime = startDateTime ?? event.startDateTime;
      event.endDateTime = endDateTime ?? event.endDateTime;
      event.description = description ?? event.description;
      event.url = url ?? event.url;
      event.location = location ?? event.location;
      event.allDay = allDay ?? event.allDay;

      await event.save();

      if (isCreator && event.creator.equals(userId) && participants && Array.isArray(participants) && participants.length > 0) {
        try {
          await shareEventWithParticipants({
            params: { calendarId: calendarId, eventId: eventId },
            body: { emails: participants },
            userId: userId 
          }, res);
          return;
        } catch(error) {
          return;
        }
      }
      return sendSuccess(res, 'Event updated successfully.');
    } catch (error) {
      return sendError(res, 500, 'Error updating the event.', error.toString());
    }
  },

  
  async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.userId;
      
      if (!mongoose.Types.ObjectId.isValid(eventId)) 
        return sendError(res, 400, 'Invalid event ID.');
      
      const user = await User.findById(userId);
        if (!user) return sendError(res, 404, 'User not found.');

      const event = await Event.findById(eventId).populate('calendar');
      if (!event) return sendError(res, 404, 'Event not found.');
      if (!event.calendar) return sendError(res, 404, 'The calendar not found.');
     
      if (user.hiddenCalendars.some(hiddenCalendarId => hiddenCalendarId.equals(calendarId))) 
        return sendError(res, 403, 'Cannot delete an event in a hidden calendar.');

      if (user.hiddenCalendars.some(hiddenCalendarId => hiddenCalendarId.equals(event.calendar._id))) 
        return sendError(res, 403, 'Cannot delete an event in a hidden calendar.');

      const hasPermission = event.calendar.creator.equals(userId) || event.creator.equals(userId);
      if (!hasPermission)
        return sendError(res, 403, 'Only the creator of the calendar or the event can delete it.');

      // event.calendar.events.pull(eventId);
      // await event.calendar.save();
      await Calendar.updateMany(
        { isDefault: true, events: eventId },
        { $pull: { events: eventId } }
      );
      await Event.findByIdAndDelete(eventId);

      return sendSuccess(res, 'Event deleted successfully.');
    } catch (error) {
      return sendError(res, 500, 'Server error occurred while deleting the event.', error.toString());
    }
  }
}

module.exports = controllerEvent;
