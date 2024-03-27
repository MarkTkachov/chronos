const express = require('express');
const controllerEvent = require('../controllers/controllerEvent');
const authenticateToken = require('../middleware/auth');
const shareEventWithParticipants = require('../controllers/controllerShareEvent');

const router = express.Router();

router.get('/api/calendar/:calendarId/events', authenticateToken, controllerEvent.getEventsByCalendarId);
router.get('/api/calendar/:calendarId/events/export', controllerEvent.getEventsByCalendarId);
router.post('/api/calendar/:calendarId/create-event', authenticateToken, controllerEvent.createEvent);
router.patch('/api/calendar/edit-event/:eventId', authenticateToken, controllerEvent.editEvent);
router.post('/api/calendar/share-event/:eventId', authenticateToken, shareEventWithParticipants);
router.delete('/api/calendar/delete-event/:eventId', authenticateToken, controllerEvent.deleteEvent);

module.exports = router;