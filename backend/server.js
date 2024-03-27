require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const app = express();
const hostname = process.env.URL;
const port = process.env.PORT || 3001;
const mongoose = require('mongoose');
require('./config/database');
const User = require('./models/User');
const Event = require('./models/Event');
const Calendar = require('./models/Calendar');
const routerAuthentication = require('./routers/routerAuthentication');
const routerCalendar = require('./routers/routerCalendar');
const routerEvent = require('./routers/routerEvent');
const routerUser = require('./routers/routerUser');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());
app.use((req, res, next) => {
  next();
});

app.use('/static/avatars', express.static('static/avatars'));

app.use('/', routerAuthentication);
app.use('/', routerEvent);
app.use('/', routerCalendar);
app.use('/', routerUser);

//how to use - fetch('http://localhost:1109/cors-proxy/' + encodeURIComponent('targetURL'))
app.use('/cors-proxy/', createProxyMiddleware({
  router: (req) => new URL(decodeURIComponent(req.path.substring('/cors-proxy/'.length))),
  pathRewrite: (path, req) => (new URL(decodeURIComponent(req.path.substring('/cors-proxy/'.length)))).pathname,
  changeOrigin: true,
  // logger: console
}))

cron.schedule('0 12 * * *', async () => {
  console.log('Running a daily task at 12:00 PM to clean up expired refresh tokens');
  const users = await User.find({'refreshTokens.0': {$exists: true}});

  users.forEach(async (user) => {
    const validTokens = user.refreshTokens.filter(i => new Date(i.expiresAt) > new Date());
    if (validTokens.length !== user.refreshTokens.length) {
      user.refreshTokens = validTokens;
      await user.save();
    }
  });
});

cron.schedule('0 0 * * 0', async () => {
  console.log('Running a bi-weekly task to clean up past events from hidden and default calendars.');
  const twoWeeksAgo = new Date(new Date().getTime() - (14 * 24 * 60 * 60 * 1000));
  
  const pastEvents = await Event.find({ endDateTime: { $lt: twoWeeksAgo } });
  const pastEventIds = pastEvents.map(event => event._id);

  if (pastEventIds.length > 0) {
    const users = await User.find();
    users.forEach(async (user) => {
      await Calendar.updateMany(
        { _id: { $in: user.hiddenCalendars }, events: { $in: pastEventIds } },
        { $pull: { events: { $in: pastEventIds } } }
      );
    });

    await Calendar.updateMany(
      { isDefault: true, events: { $in: pastEventIds } },
      { $pull: { events: { $in: pastEventIds } } }
    );

    await Event.deleteMany({ _id: { $in: pastEventIds } });
    console.log(`Deleted ${pastEventIds.length} past events from hidden and default calendars.`);
  }

  const usersWithHiddenCalendars = await User.find({ 'hiddenCalendars.0': { $exists: true } });

  for (const user of usersWithHiddenCalendars) {
    for (const hiddenCalendarId of user.hiddenCalendars) {
      const calendar = await Calendar.findById(hiddenCalendarId);
      if (calendar && (calendar.events.length === 0 || !calendar.events)) {
        await Calendar.findByIdAndRemove(hiddenCalendarId);
        await User.findByIdAndUpdate(user._id, { $pull: { hiddenCalendars: hiddenCalendarId } });
      }
    }
  }
});


app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
