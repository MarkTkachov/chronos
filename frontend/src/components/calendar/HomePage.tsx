import { EventClickArg } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import iCalendarPlugin from '@fullcalendar/icalendar';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Modal } from 'antd-mobile';
import { UnorderedListOutline } from 'antd-mobile-icons';
import { FC, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { fetchAllCalendarsWithEvents, fetchEventsFromCalendarById, fetchHolidays } from "../../redux/calendarsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { ICalendar, IEvent, IHolidayEventParsed } from "../../types/calendars";
import CenterContainer from "../common/CenterContainer";
import FullScreenContainer from "../common/FullScreenContainer";
import { CalendarSelectorBlock } from './CalendarSelectorBlock';
import { CreateCalendarButton } from './CreateCalendarButton';
import { CreateEventForm } from './CreateEventForm';
import { EventDisplay } from './EventDisplay';
import { HolidaySelector } from './HolidaySelector';
import { ProfileButton } from './ProfileButton';
import { SideBar } from "./SideBar";
import { TopBar } from "./TopBar";
import { Logo } from '../common/Logo';
import { HamburgerMenu } from '../common/HamburgerMenu';

const CalendarContainer = styled(CenterContainer) <{ $isSidebarCollapsed: boolean }>`
    display: block;
    height: calc(100% - 80px);
    width: ${props => props.$isSidebarCollapsed ? '100%' : 'calc(100% - 300px)'};
    padding: 15px;
    padding-bottom: 0px;
    box-sizing: border-box;
    position: absolute;
    right: 0px;

    transition: width 500ms cubic-bezier(0.65, 0, 0.35, 1) 0s;
    @media screen and (max-width: 800px){
        width: 100%;
    }

    //calendar style override
    //add horizontal scroll to event title
    .fc-event-title {
        overflow-x: scroll;
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }
    }
`


export const HomePage: FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth <= 800 ? false : true);
    const calendarRef = useRef<FullCalendar>(null);
    const eventSources: ICalendar[] = useAppSelector(state => state.calendars?.calendars);
    const user = useAppSelector(state => state.auth.user);
    const holidaysSource: { events: IHolidayEventParsed[] } = useAppSelector(state => state.calendars.holidays);
    const holidaysStatus: 'loading' | 'fulfilled' | 'rejected' | null = useAppSelector(state => state.calendars.holidaysLoading);
    const [holidaysSelected, setHolidaysSelected] = useState(true);
    const [refreshState, setRefreshState] = useState(false);
    const refresh = () => setRefreshState(!refreshState);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!holidaysStatus) dispatch(fetchHolidays());
    }, [holidaysStatus])

    const selectedEventSources = useMemo(() => {
        return holidaysSelected
            ? [...eventSources.filter(cal => cal.selected), holidaysSource]
            : eventSources.filter(cal => cal.selected);
    }, [eventSources, holidaysSource, holidaysSelected])

    const localCalendars = useMemo(() => {
        return eventSources.filter(cal => cal.type == 'local');
    }, [eventSources])

    useEffect(() => {
        dispatch(fetchAllCalendarsWithEvents());
    }, [refreshState])

    const toggleSideBar = () => {
        setSidebarOpen(!sidebarOpen);
        //wait for animation and then resize
        setTimeout(() => calendarRef.current?.getApi().updateSize(), 550);
    }

    const handleEventClick: (arg: EventClickArg) => void = (arg) => {
        arg.jsEvent.preventDefault();
        const origEvent = arg.event.extendedProps?.originalObject as IEvent;
        // console.log(origEvent);

        if (!origEvent) return;

        const modalHandle = Modal.show({
            content: <EventDisplay
                eventObj={origEvent}
                closeHandle={() => modalHandle.close()}
                eventsRefetch={refresh} />,
            closeOnMaskClick: true,
            showCloseButton: true
        })


    }

    const handleDateClick: (arg: DateClickArg) => void = (arg) => {
        const modalHandle = Modal.show({
            content: <CreateEventForm
                localCalendars={localCalendars}
                startTime={arg.date}
                refreshSelectedCal={(id) => dispatch(fetchEventsFromCalendarById(id))}
                refreshCalendars={refresh}
                closeHandle={() => modalHandle.close()}
                setHour={
                    calendarRef.current?.getApi().view.type == 'timeGridDay' ||
                        calendarRef.current?.getApi().view.type == 'timeGridWeek'
                        ? false : 9}
            />,
            closeOnMaskClick: true,
            showCloseButton: true
        })
        // console.log(calendarRef.current?.getApi().view.type);

    }

    return (
        <>
            <FullScreenContainer>
                <TopBar>
                    <HamburgerMenu onClick={toggleSideBar} />
                    <div style={{ width: '20px'}}></div>
                    {/* {!sidebarOpen && <CreateCalendarButton />} */}
                    <ProfileButton />
                    <div style={{ marginLeft: 'auto', marginRight: '20px'}}>
                        <Logo />
                    </div>
                    

                </TopBar>

                <SideBar $collapse={!sidebarOpen}>
                    <CreateCalendarButton />
                    <CalendarSelectorBlock />
                    <HolidaySelector selected={holidaysSelected} onChange={() => setHolidaysSelected(!holidaysSelected)} />

                </SideBar>
                <CalendarContainer $isSidebarCollapsed={!sidebarOpen}>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, iCalendarPlugin, interactionPlugin, timeGridPlugin]}
                        initialView={window.innerWidth <= 800 ? "timeGridDay" : "dayGridMonth"}
                        headerToolbar={{
                            start: 'timeGridDay,timeGridWeek,dayGridMonth',
                            center: 'title',
                            end: 'prev,next'
                        }}
                        buttonText={{
                            timeGridDay: 'Day',
                            week: 'Week',
                            month: 'Month'
                        }}
                        eventTimeFormat={{
                            hour: 'numeric',
                            minute: '2-digit',
                            meridiem: false,
                            hour12: false
                        }}
                        height={'100%'}
                        eventClick={handleEventClick}
                        dateClick={handleDateClick}

                        eventSources={[...selectedEventSources]}
                    />
                </CalendarContainer>




            </FullScreenContainer>
        </>
    );
}
