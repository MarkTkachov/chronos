export interface ICalendar {
    _id: string,
    title: string,
    //url to iCal calendar from which was downloaded
    sourceUrl?: string,
    exportUrl?: string,
    type?: 'imported' | 'local',
    selected: boolean,
    events?: IEvent[],
    creatorEmail: string,
    creatorId: string
    isDefault?: boolean,
    color?: string,
    textColor?: string,
    role?: 'editor' | 'viewer' | 'creator'
}

export interface IEvent {
    // id and uid are the same
    id: string,
    uid: string,
    title: string,
    color?: string,
    description?: string,
    //ISO string YYYY-MM-DDTHH:mm:ss.sssZ
    start: string,
    //ISO string YYYY-MM-DDTHH:mm:ss.sssZ
    end?: string,
    allDay?: boolean,
    //email
    organizer?: string,
    //send as JSON string
    participants?: string[],
    location?: string,
    addUrl?: string,
    role?: 'creator' | 'editor' | 'viewer',
    calendarType?: 'imported' | 'local',

    originalObject?: Omit<IEvent, 'originalObject'>
}
//https://date.nager.at/swagger/index.html
export interface IHolidayEventReceived {
    date: string,
    localName: string,
    name: string,
    countryCode: string,
    fixed: boolean,
    global: boolean,
    countries?: string[],
    launchYear?: string,
    types?: string[] 
}

export interface IHolidayEventParsed {
    title: string,
    start: string,
    allDay: boolean,
    end: string,
    
}
//For VEVENT
// const DBPropsToICalProps = {
//     _id: 'UID',
//     title: 'SUMMARY',
//     description: 'DESCRIPTION',
//     url: 'URL' || 'X-URL',
//     startDateTime: 'DTSTART',
//     endDateTime: 'DTEND',
//     timeZone: 'not needed',
//     location: 'LOCATION',
//     creator: 'ORGANIZER',
//     participants: 'PARTICIPANTS' || 'X-PARTICIPANTS',
//     calendarColor: 'COLOR',
// }


