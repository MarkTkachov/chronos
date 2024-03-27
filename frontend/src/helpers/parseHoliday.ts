import { IHolidayEventParsed, IHolidayEventReceived } from "../types/calendars";

export function parseHoliday(received: IHolidayEventReceived): IHolidayEventParsed {
    return ({
        title: received.localName,
        start: new Date(received.date).toISOString(),
        allDay: true,
        end: new Date(received.date).toISOString()
    });
}
