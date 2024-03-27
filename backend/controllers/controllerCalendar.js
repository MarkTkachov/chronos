const Calendar = require('../models/Calendar');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError, sendSuccess } = require('../utils/error/responseHelpers');
const generateNewUrlForCalendar = require('../utils/ical/generateNewUrlForCalendar');
const sendEmail = require('../utils/email/sendEmail');
const getSecret = require('../config/getSecret');
const { validateCalendarExists, validateUserPermissions } = require('../utils/validate/calendar/validationHelpers');
const { handleCalendarDeletion } = require('../utils/validate/calendar/deletionCalendar');

const controllerCalendar = {
  async getCalendarByUserId(req, res) {
    try {
      const userId = req.userId;
      const user = await User.findById(userId);
      const hiddenCalendarIds = user.hiddenCalendars;

      const calendars = await Calendar.find({
        $and: [{$or: [
          { creator: userId },
          { participants: { $elemMatch: {userId: userId, accepted: true} } }]},
          {_id: {$nin: hiddenCalendarIds}}]}).populate('creator', 'email');

      const response = await Promise.all(calendars.map(async calendar => {
        const calendarResponse = {
          _id: calendar._id,
          title: calendar.title,
          sourceUrl: calendar.url !== '' ? calendar.url : await generateNewUrlForCalendar('local', calendar),
          exportUrl: calendar.url !== '' ? calendar.url : await generateNewUrlForCalendar('export', calendar, userId),
          type: calendar.type,
          isDefault: calendar.isDefault,
          creatorId: calendar.creator._id,
          creatorEmail: calendar.creator.email,
          color: calendar.color,
          role: "creator"
        };

        const participant = calendar.participants.find(participant =>
          participant.userId && participant.userId.toString() === userId.toString()
        );

        if (participant && participant.accepted) calendarResponse.role = participant.role;
      
        return calendarResponse;
      }));

      res.json(response);
    } catch(error) {
      sendError(res, 500, 'Server error occurred.', error.toString());
    }
  },

  async createrCalendar(req, res) {
    try {
      const {title, url, /*participantsArray,*/ color} = req.body;
      const userId = req.userId;
      if (!title) 
        return sendError(res, 400, 'Title is required and cannot be empty.');

      const user = await validateUserPermissions(userId, res);
      if (!user) return;

      const type = url ? 'imported' : 'local';
      const calendarData = {
        title,
        type,
        creator: userId
      };

      if (url) calendarData.url = url;
      if (color) calendarData.color = color;

      const newCalendar = new Calendar(calendarData);
      await newCalendar.save();

      // if (participantsArray && Array.isArray(participantsArray) && participantsArray.length > 0) {
      //   try {
      //     await shareCalendarWithParticipants({
      //       params: { calendarId: newCalendar._id },
      //       body: { participantsArray },
      //       userId: userId 
      //     }, res);
      //     return;
      //   } catch(error) {
      //     return;
      //   }
      // }

      sendSuccess(res, 'Calendar created successfully.');
    } catch(error) {
      sendError(res, 500, 'Server error occurred.', error.toString());
    }
  },

  async editCalendar(req, res) {
    try {
      const { calendarId } = req.params;
      const {title, color /*participantsArray*/ } = req.body;
      const userId = req.userId;

      const user = await validateUserPermissions(userId, res);
      if (!user) return;

      const calendar = await validateCalendarExists(calendarId, userId, res);
      if (!calendar) return;

      if (calendar.isDefault) return sendError(res, 403, "Default calendar cannot be edited.");
      
      if (user.hiddenCalendars.some(hiddenCalendarId => hiddenCalendarId.equals(calendarId))) 
        return sendError(res, 403, 'Cannot edit a calendar in a hidden calendar.');

      const updatedCalendarData = {};
      if (title) updatedCalendarData.title = title;
      if (color) updatedCalendarData.color = color;

      await Calendar.findByIdAndUpdate(
        calendarId,
        {$set: updatedCalendarData}
      );

      // if (participantsArray && Array.isArray(participantsArray) && participantsArray.length > 0) {
      //   try {
      //     await shareCalendarWithParticipants({
      //       params: { calendarId: calendarId },
      //       body: { participantsArray },
      //       userId: userId 
      //     }, res);
      //     return;
      //   } catch(error) {
      //     return;
      //   }
      // }

      sendSuccess(res, 'Calendar updated successfully.');
    } catch(error) {
      sendError(res, 500, 'Server error occurred.', error.toString());
    }
  },

  async deleteCalendar(req, res) {
    try {
      const {calendarId} = req.params;
      const userId = req.userId;
      const deleteForAll = req.query.deleteForAll === 'true';

      const user = await validateUserPermissions(userId, res);
        if (!user) return;

      const calendar = await validateCalendarExists(calendarId, userId, res);
        if (!calendar) return;

      if (calendar.isDefault) return sendError(res, 403, 'Default calendar cannot be deleted.');

      if (user.hiddenCalendars.some(hiddenCalendarId => hiddenCalendarId.equals(calendarId))) 
        return sendError(res, 403, 'Cannot delete a calendar in a hidden calendar.');

      await handleCalendarDeletion(calendarId, userId, deleteForAll, res);
    } catch(error) {
      sendError(res, 500, 'Error deleting calendar.', error.toString());
    }
  },

  async acceptInvitation(req, res) {
    try {
      const { calendarId } = req.params;
      const { token } = req.query;

      const decoded = jwt.verify(token, await getSecret(1));
      const email = decoded.email;

      const calendar = await Calendar.findById(calendarId).populate('creator', 'email');
      if (!calendar) return sendError(res, 404, 'Calendar not found');

      const participantIndex = calendar.participants.findIndex(participant => participant.emailParticipant === email);
      if (participantIndex === -1 || calendar.participants[participantIndex].accepted) 
        return sendError(res, 400, 'Invalid or already accepted invitation.');

      calendar.participants[participantIndex].accepted = true;
      await calendar.save();

      await sendEmail(calendar.creator.email, 'calendarNotification', '', calendar.title, email, calendar.title);

      const userExists = await User.findOne({ email: email });
      let redirectUrl;
      if (userExists) redirectUrl = 'login';
      else redirectUrl = 'register';
      res.redirect(`${process.env.FRONTEND_URL}/${redirectUrl}`);
    } catch(error) {
      sendError(res, 500, 'Error accepted calendar.', error.toString());
    }
  }
}

module.exports = controllerCalendar;