const User = require('../models/User');
const Calendar = require('../models/Calendar');
const {sendError, sendSuccess} = require('../utils/error/responseHelpers');
const sendEmail = require('../utils/email/sendEmail');
const validateEvent = require('../utils/validate/event/validateEvent');
const validateUserPermissions = require('../utils/validate/event/validateUserPermissions');
const validateParticipantsArray = require('../utils/validate/calendar/validateParticipantsArray');
const isValidEmail = require('../utils/regexEmail');

async function filterEmails(emails, event, calendar, authorEmail) {
  const calendarParticipantEmails = calendar.participants.map(participant => participant.emailParticipant);
  return emails.filter(email => 
    !event.participants.some(participant => participant.emailParticipant === email) &&
    !calendarParticipantEmails.includes(email) &&
    email !== authorEmail
  );
}

async function addParticipantsAndSendInvites(emailsToAdd, event) {
  const newParticipants = [];
  for (const email of emailsToAdd) {
    const user = await User.findOne({ email });
    if (user) {
      const defaultCalendar = await Calendar.findOne({ creator: user._id, isDefault: true });
      if (defaultCalendar) {
        defaultCalendar.events.push(event._id);
        await defaultCalendar.save();
      }
      newParticipants.push({
        emailParticipant: email,
        userId: user._id
      });
    } else {
      newParticipants.push({
        emailParticipant: email,
        userId: null
      });
    }
  }
  return newParticipants;
}

const shareEventWithParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { emails } = req.body; 
    const userId = req.userId; 

    if (!validateParticipantsArray(emails, res)) return;

    emails = emails.filter(isValidEmail);
 
    const user = await User.findById(userId);

    const event = await validateEvent(eventId, res);
    if (!event) return;

    const permissionError = await validateUserPermissions(userId, event, user, res);
    if (permissionError) return;

    event.participants = event.participants.filter(p => emails.includes(p.emailParticipant));
    const emailsToAdd = await filterEmails(emails, event, event.calendar, user.email);
    const newParticipants = await addParticipantsAndSendInvites(emailsToAdd, event);

    if (newParticipants.length > 0) {
      event.participants.push(...newParticipants);
      await event.save();
      newParticipants.forEach(participant => {
        sendEmail(participant.emailParticipant, 'eventAccess', '', '', user.email, event.title);
      });
      sendSuccess(res, 'Event shared successfully with new participants.');
    } else 
      sendSuccess(res, 'No new participants to share with.');
  } catch (error) {
    return sendError(res, 500, 'Server error occurred.', error.message);
  }
};

module.exports = shareEventWithParticipants;