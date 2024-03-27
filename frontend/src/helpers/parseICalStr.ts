import ICAL from 'ical.js';
import { IEvent } from '../types/calendars';

export default function parseICalStr(input: string, role: 'creator' | 'editor' | 'viewer' = 'viewer', calendarType: 'local' | 'imported'| undefined): IEvent[] {
    // console.log(input);
    try {
        const jCalData = ICAL.parse(input);
        const rootComp = new ICAL.Component(jCalData);
        const parsedEvents: IEvent[] = []
        const eventsComps = rootComp.getAllSubcomponents('vevent');
        // console.log(eventsComps);

        for (const event of eventsComps) {
            const eventModel = new ICAL.Event(event);
            const parsed: IEvent = {
                id: '',
                uid: '',
                title: '',
                start: new Date().toISOString()
            };
            parsed.id = eventModel.uid;
            parsed.uid = eventModel.uid;
            parsed.title = eventModel.summary;

            parsed.start = eventModel.startDate.toJSDate().toISOString();
            parsed.end = eventModel.endDate.toJSDate().toISOString();
            parsed.allDay = eventModel.startDate.isDate;
            
            parsed.location = eventModel.location;
            parsed.description = eventModel.description;
            parsed.color = event.getFirstPropertyValue('color');
            if (!parsed.color) delete parsed.color;
            parsed.organizer = event.getFirstPropertyValue('organizer');
            parsed.addUrl = event.getFirstPropertyValue('url') || event.getFirstPropertyValue('x-url');
            parsed.role = role;
            parsed.calendarType = calendarType;

            const participantsStr = event.getFirstPropertyValue('participants') || event.getFirstPropertyValue('x-participants');
            parsed.participants = undefined;
            if (participantsStr) {
                parsed.participants = JSON.parse(participantsStr);
            }
            parsed.originalObject = {...parsed};
            
            parsedEvents.push(parsed);

        }

        return parsedEvents;

    } catch (error) {
        console.error(error);
        return [];
    }



}
