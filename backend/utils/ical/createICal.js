const ICAL = require('ical.js');
const getOrganizerEmailById = require('./getOrganizerByUserId');

async function createICal(events) {
  const cal = new ICAL.Component(['vcalendar', [], []]);
  cal.updatePropertyWithValue('prodid', '-//CHRONOS//EN');
  cal.updatePropertyWithValue('version', '2.0');

  for (const event of events) {
    const vevent = new ICAL.Component('vevent');
    vevent.updatePropertyWithValue('uid', event._id.toString());
    vevent.updatePropertyWithValue('summary', event.title);

    if (event.description)
      vevent.updatePropertyWithValue('description', event.description);

    let startTime = ICAL.Time.fromJSDate(new Date(event.startDateTime));
    let endTime = ICAL.Time.fromJSDate(new Date(event.endDateTime));

    if (event.allDay) {
      startTime = new ICAL.Time({isDate: true}).fromJSDate(new Date(event.startDateTime));
      endTime = new ICAL.Time({isDate: true}).fromJSDate(new Date(event.endDateTime));
    }
    
    vevent.updatePropertyWithValue('dtstart', startTime);
    vevent.updatePropertyWithValue('dtend', endTime);

    if (event.location) 
      vevent.updatePropertyWithValue('location', event.location);
    

    if (event.url) {
      vevent.updatePropertyWithValue('x-url', event.url);
      vevent.updatePropertyWithValue('url', event.url);
    }

    const organizerEmail = await getOrganizerEmailById(event.creator);
    if (organizerEmail) 
      vevent.updatePropertyWithValue('organizer', organizerEmail);

    if (event.participants) {
      const emails = JSON.stringify(event.participants.map(participant => participant.emailParticipant));
      vevent.updatePropertyWithValue('x-participants', emails);
    }
    
    cal.addSubcomponent(vevent);
  }
  return cal.toString();
}

module.exports = createICal
