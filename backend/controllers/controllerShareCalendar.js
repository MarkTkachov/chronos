const User = require('../models/User');
const Event = require('../models/Event');
const { sendError, sendSuccess } = require('../utils/error/responseHelpers');
const sendEmail = require('../utils/email/sendEmail');
const generateToken = require('../utils/tokens/generateToken');
const validateParticipantsArray = require('../utils/validate/calendar/validateParticipantsArray');
const getCalendarAndValidatePermissions = require('../utils/validate/calendar/getCalendarAndValidatePermissions');
const isValidEmail = require('../utils/regexEmail');

async function removeUserFromEventParticipants(user, calendarId) {
  const events = await Event.find({
    calendar: calendarId,
    'participants.userId': user._id
  });

  for (const event of events) {
    event.participants = event.participants.filter(participant =>
      participant && participant.userId && participant.userId.equals(user._id) ? false : true
    );
    await event.save();
  }
}

async function processParticipants(participantsArray, calendar) {
  for (const {email, role = 'viewer'} of participantsArray) {
    if (!email || !isValidEmail(email)) continue;
    const user = await User.findOne({ email });
    let participantIndex = calendar.participants.findIndex(participant => {
      if (user && participant.userId && participant.userId.equals) 
        return participant.userId.equals(user._id);
      else
        return participant.emailParticipant === email;
    });

    await processIndividualParticipant(participantIndex, calendar, email, role, user);
  }
}

async function processIndividualParticipant(participantIndex, calendar, email, role, user) {
  const action = 'invitation';
  if (participantIndex !== -1) {
    const participant = calendar.participants[participantIndex];
    if (!participant.accepted || participant.role !== role) {
      calendar.participants[participantIndex].role = role;
      if (!participant.accepted) {
        const tokenInvitation = await generateToken(action, { email });
        await sendEmail(email, action, tokenInvitation, calendar._id, calendar.creator.email, calendar.title);
      }
    }
  } else {
    if (user) await removeUserFromEventParticipants(user, calendar._id);
    calendar.participants.push({
      emailParticipant: email,
      userId: user ? user._id : null,
      accepted: false,
      role: role,
    });
    const tokenInvitation = await generateToken(action, { email });
    await sendEmail(email, action, tokenInvitation, calendar._id, calendar.creator.email, calendar.title);
  }
}


const shareCalendarWithParticipants = async (req, res) => {
  try {
    const { calendarId } = req.params;
    const userId = req.userId;
    let { participantsArray } = req.body;

    if (!validateParticipantsArray(participantsArray, res)) return;

    const calendar = await getCalendarAndValidatePermissions(calendarId, userId, res);
    if (!calendar) return;

    participantsArray = participantsArray.filter(participant => participant.email !== calendar.creator.email);

    await processParticipants(participantsArray, calendar, res);

    await calendar.save();
    sendSuccess(res, 'Invitations sent to the users.');
  } catch (error) {
    sendError(res, 500, 'Error sharing calendar.', error.toString());
  }
};

module.exports = shareCalendarWithParticipants;

