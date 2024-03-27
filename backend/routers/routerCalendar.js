const express = require('express');
const controllerCalendar = require('../controllers/controllerCalendar');
const authenticateToken = require('../middleware/auth');
const shareCalendarWithParticipants = require('../controllers/controllerShareCalendar');

const router = express.Router();

router.get('/api/calendars', authenticateToken, controllerCalendar.getCalendarByUserId);
router.post('/api/calendar', authenticateToken, controllerCalendar.createrCalendar);
router.patch('/api/calendar/:calendarId', authenticateToken, controllerCalendar.editCalendar);
router.delete('/api/calendar/:calendarId/delete', authenticateToken, controllerCalendar.deleteCalendar);
router.post('/api/calendar/:calendarId/share', authenticateToken, shareCalendarWithParticipants);
router.get('/api/calendar/:calendarId/accept-invitation', controllerCalendar.acceptInvitation);

module.exports = router;