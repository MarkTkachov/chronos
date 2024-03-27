import axios from "axios";
import { ICalendar } from "../types/calendars";
import parseICalStr from "./parseICalStr";
import refreshOnDemand from "./refreshOnDemand";

export default async function loadICalFromURL(
    url: string | null = null, 
    name: string = '', 
    _id: string = '', 
    isLocal: boolean = false,
    role: 'creator' | 'editor' | 'viewer' = 'viewer',
    calendarType: 'local' | 'imported' | undefined
    ): Promise<Omit<ICalendar, 'creatorEmail' | 'creatorId'> | undefined>  {
    if (!url) return;
    try {
        // console.log(isLocal);

        const resp = await refreshOnDemand(() => axios.get(url, { withCredentials: isLocal }));
        const icalStr: string = resp.data;
        const cal: Omit<ICalendar, 'creatorEmail' | 'creatorId'> = {
            _id,
            title: name,
            sourceUrl: url,
            selected: true,
            events: parseICalStr(icalStr, role, calendarType)
        }
        return cal;
    } catch (error) {
        console.error(error);
        return;

    }
}
