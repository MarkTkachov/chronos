import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosResponse } from "axios";
import loadICalFromURL from "../helpers/loadICalFromURL";
import { parseHoliday } from "../helpers/parseHoliday";
import { pickTextColorBasedOnBgColorAdvanced } from "../helpers/pickTextColorBasedOnBgColorAdvanced";
import { proxiedUrl } from "../helpers/proxiedUrl";
import refreshOnDemand from "../helpers/refreshOnDemand";
import { ICalendar, IEvent, IHolidayEventParsed, IHolidayEventReceived } from "../types/calendars";
import { AppThunkDispatch, RootState } from "./store";

const createAppAsyncThunk = createAsyncThunk.withTypes<{
    state: RootState
    dispatch: AppThunkDispatch
    rejectValue: string
    extra: { s: string; n: number }
}>()

interface IInitCalendars {
    calendars: ICalendar[],
    holidays: { events: IHolidayEventParsed[] },
    holidaysLoading: 'loading' | 'fulfilled' | 'rejected' | null
}

const initialState: IInitCalendars = {
    calendars: [],
    holidays: { events: [] },
    holidaysLoading: null
}

const calendarsSlice = createSlice({
    name: 'calendars',
    initialState,
    reducers: {
        toggleCalSelection(state, action: { payload: string }) {
            const entry: ICalendar | undefined = state.calendars.find(o => o._id == action.payload);
            if (!entry) return;
            entry.selected = !entry.selected;
        },
        setCalendars(state, action: { payload: ICalendar[] }) {
            const cals: ICalendar[] = action.payload;
            const oldCals = state.calendars;
            const newCals: ICalendar[] = [];
            for (const cal of cals) {
                if (!cal) continue;
                const foundCalInOld = oldCals.find((o) => o._id == cal._id);
                if (foundCalInOld)
                    newCals.push({ ...cal, selected: foundCalInOld.selected });
                else
                    newCals.push({ ...cal, selected: true });
            }
            state.calendars = newCals;
        },
        setCalendarEvents(state, action: { payload: { id: string, events: IEvent[] } }) {
            const allCals = state.calendars;
            const { id, events } = action.payload;
            const foundCalIndex = allCals.findIndex(cal => cal._id == id);
            if (foundCalIndex < 0) return;

            state.calendars[foundCalIndex].events = events;

        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchHolidays.fulfilled, (state, action) => {
            state.holidays = action.payload;
            state.holidaysLoading = 'fulfilled';
        })
        .addCase(fetchHolidays.rejected, (state, action) => {
            state.holidaysLoading = 'rejected';
        })
        .addCase(fetchHolidays.pending, (state, action) => {
            state.holidaysLoading = 'loading';
        })
    }

})

export const fetchEventsFromCalendars = createAppAsyncThunk('calendars/fetchEventsFromCalendars',
    async (payload: undefined, thunkAPI) => {
        const calendars = thunkAPI.getState().calendars.calendars;
        const fetches = calendars.map((cal) =>
            cal.sourceUrl
                ? loadICalFromURL(cal.type == 'local' ? cal.sourceUrl : proxiedUrl(cal.sourceUrl), cal.title, cal._id, cal.type == 'local', cal.role, cal.type)
                : undefined);
        const newCals = (await Promise.all(fetches)).filter((cal) => cal !== undefined);
        // return newCals as ICalendar[];
        if (newCals)
            thunkAPI.dispatch(setCalendars(newCals as ICalendar[]));
    }
)

export const fetchAllCalendarsWithEvents = createAppAsyncThunk('calendars/fetchAllCalendarsWithEvents',
    async (payload: undefined, thunkAPI) => {
        const calListResp = await refreshOnDemand(() => axios.get('/calendars'));
        const calList: Omit<ICalendar, 'selected'>[] = calListResp.data;
        const resultList: ICalendar[] = [];
        for (const cal of calList) {
            try {
                if (!cal.sourceUrl) continue;
                const calUrl = cal.type == 'local' ? cal.sourceUrl : proxiedUrl(cal.sourceUrl);
                const newCal = await loadICalFromURL(calUrl, cal.title, cal._id, cal.type == 'local', cal.role, cal.type);
                if (!newCal) continue;
                const fullNewCal: ICalendar = {
                    ...cal,
                    ...newCal,
                }
                fullNewCal.textColor = pickTextColorBasedOnBgColorAdvanced(fullNewCal.color);
                // console.log(fullNewCal);

                resultList.push(fullNewCal);
            } catch (error) {
                continue;
            }
        }

        thunkAPI.dispatch(setCalendars(resultList));
    }
)

export const fetchEventsFromCalendarById = createAppAsyncThunk('calendars/fetchEventsFromCalendarById',
    async (payload: string, thunkAPI) => {
        try {
            const id = payload;
            const calendars = thunkAPI.getState().calendars.calendars;
            const cal = calendars.find(cal => cal._id == id);
            if (!cal || !cal.sourceUrl) return;
            const calUrl = cal.type == 'local' ? cal.sourceUrl : proxiedUrl(cal.sourceUrl);
            const newCal = await loadICalFromURL(calUrl, cal.title, cal._id, cal.type == 'local', cal.role, cal.type);
            const newEvents = newCal?.events;
            if (!newEvents) return;
            thunkAPI.dispatch(setCalendarEvents({ id, events: newEvents }));

        } catch (error) {
            console.error(error);

        }
    }
)

export const fetchHolidays = createAppAsyncThunk('calendar/fetchHolidays',
    async (payload: undefined, thunkApi) => {
        const locResp = await axios.get(`http://ip-api.com/json/`, { withCredentials: false });
        const countryCode: string = locResp.data.countryCode;
        const currentYear = new Date().getFullYear();
        const fetchesArray: Promise<AxiosResponse>[] = [
            axios.get(`https://date.nager.at/api/v3/PublicHolidays/${currentYear - 1}/${countryCode}`, { withCredentials: false }),
            axios.get(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode}`, { withCredentials: false }),
            axios.get(`https://date.nager.at/api/v3/PublicHolidays/${currentYear + 1}/${countryCode}`, { withCredentials: false }),
        ]
        const responces = await Promise.all(fetchesArray);
        const events: IHolidayEventReceived[] = responces.map(resp => resp.data).flat();
        return {
            events: events.map(e => parseHoliday(e))
        }

    }
)


export default calendarsSlice.reducer;

export const { toggleCalSelection, setCalendars, setCalendarEvents } = calendarsSlice.actions

