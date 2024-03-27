import { Button, DatePicker, Picker, Switch, Toast } from "antd-mobile";
import axios from "axios";
import { FC, useEffect, useMemo, useState } from "react";
import emailRegex from '../../helpers/emailRegex';
import refreshOnDemand from "../../helpers/refreshOnDemand";
import { ICalendar } from "../../types/calendars";
import { CenterColumn } from "../common/CenterColumn";
import { Row } from "../common/Row";
import { StyledInputText } from "../common/StyledInputText";
import { StyledLabel } from "../common/StyledLabel";
import { StyledTextArea } from "../common/StyledTextArea";

export const CreateEventForm: FC<{
    localCalendars: ICalendar[],
    refreshCalendars?: VoidFunction,
    refreshSelectedCal?: (id: string) => void,
    closeHandle: VoidFunction,
    startTime: string | Date,
    setHour?: false | number
}> = ({ localCalendars, refreshCalendars, closeHandle, startTime, setHour = 9, refreshSelectedCal }) => {

    const [startDefaultDate, endDefaultDate] = useMemo(() => {
        const date = new Date(startTime);
        if (typeof setHour === 'number') {
            date.setHours(setHour);
        }
        const end = new Date(date.getTime() + 30 * 60 * 1000);
        return [date, end]
    }, [startTime, setHour]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [url, setUrl] = useState('');

    const [startDateTime, setStartDateTime] = useState<Date | null>(startDefaultDate);
    const [showStartSelector, setShowStartSelector] = useState(false);

    const [endDateTime, setEndDateTime] = useState<Date | null>(endDefaultDate);
    const [showEndSelector, setShowEndSelector] = useState(false);

    const [allDay, setAllDay] = useState(false);

    const [emailsInput, setEmailsInput] = useState('');

    const defaultCalendar = useMemo(() => {
        return localCalendars.find((cal) => cal.isDefault)?._id;
    }, [localCalendars])

    const [selectedCalendarId, setSelectedCalendarId] = useState(defaultCalendar);
    const [showCalendarSelector, setShowCalendarSelector] = useState(false);

    const selectedCalendar = useMemo(() => {
        return localCalendars.find(cal => cal._id == selectedCalendarId);
    }, [localCalendars, selectedCalendarId])

    const calendarOptions = useMemo(() => {
        return [localCalendars.map(cal => ({ label: cal.title, value: cal._id }))]
    }, [localCalendars]);

    useEffect(() => {
        if (!startDateTime || !endDateTime) return;
        if (startDateTime > endDateTime) setEndDateTime(new Date(startDateTime)); 
    }, [startDateTime, endDateTime]);



    const handleCreate = async () => {
        if (title.trim().length === 0) {
            Toast.show(`Title is required`);
            return;
        }
        if (!selectedCalendarId || selectedCalendarId.trim().length === 0) {
            Toast.show(`Calendar is required`);
            return;
        }
        const emails: string[] = emailsInput.trim().split(' ').filter(val => val.trim().length !== 0);
        for (const email of emails) {
            if (!emailRegex.test(email)) {
                Toast.show(`Value ${email} is not valid email`);
                return;
            }
        }

        try {
            await refreshOnDemand(() => axios.post(`/calendar/${encodeURIComponent(selectedCalendarId)}/create-event`, {
                title,
                startDateTime: startDateTime?.toISOString(),
                endDateTime: endDateTime?.toISOString(),
                participants: emails,
                description: description.trim(),
                allDay,
                location: location.trim().length === 0 ? null : location.trim(),
                url: url.trim().length === 0 ? null : url.trim(),
            }))
            if (refreshSelectedCal) {
                refreshSelectedCal(selectedCalendarId);
            }
            else if (refreshCalendars) {
                refreshCalendars();
            }

            closeHandle();
        } catch (error) {
            if (axios.isAxiosError(error))
                Toast.show(error.response?.data.message);
        }

    }

    return (
        <>
            <CenterColumn>
                <Row>
                    <StyledLabel >Calendar</StyledLabel> <Button onClick={() => setShowCalendarSelector(true)}>{selectedCalendar?.title}</Button>
                    <Picker
                        columns={calendarOptions}
                        visible={showCalendarSelector}
                        onClose={() => setShowCalendarSelector(false)}
                        onSelect={(val) => {
                            if (typeof val[0] === 'string')
                                setSelectedCalendarId(val[0])
                        }}
                        value={selectedCalendarId ? [selectedCalendarId] : []}
                        confirmText={'OK'}
                        cancelText={'Cancel'}
                    />
                </Row>
                <StyledLabel >Event title</StyledLabel>
                <StyledInputText value={title} onChange={e => setTitle(e.target.value)} />
                <StyledLabel >Description</StyledLabel>
                <StyledTextArea value={description} onChange={e => setDescription(e.target.value)} />
                <StyledLabel >Location</StyledLabel>
                <StyledInputText value={location} onChange={e => setLocation(e.target.value)} />
                <StyledLabel >Attached Link</StyledLabel>
                <StyledInputText value={url} onChange={e => setUrl(e.target.value)} />
                <Row>
                    <StyledLabel>All Day</StyledLabel>
                    <Switch checked={allDay} onChange={val => setAllDay(val)} />
                </Row>
                <Row>
                    <StyledLabel >Start time</StyledLabel>
                    <Button onClick={() => setShowStartSelector(true)}>{allDay ? startDateTime?.toLocaleDateString() : startDateTime?.toLocaleString()}</Button>
                    <DatePicker
                        visible={showStartSelector}
                        defaultValue={startDefaultDate}
                        value={startDateTime}
                        onClose={() => setShowStartSelector(false)}
                        closeOnMaskClick
                        precision={allDay ? 'day' : "minute"}
                        onSelect={(val) => setStartDateTime(val)}
                        confirmText={'OK'}
                        cancelText={'Cancel'}
                    />
                </Row>

                <Row>
                    <StyledLabel >End time</StyledLabel>
                    <Button onClick={() => setShowEndSelector(true)}>{allDay ? endDateTime?.toLocaleDateString() : endDateTime?.toLocaleString()}</Button>
                    <DatePicker
                        visible={showEndSelector}
                        defaultValue={endDefaultDate}
                        value={endDateTime}
                        onClose={() => setShowEndSelector(false)}
                        closeOnMaskClick
                        precision={allDay ? 'day' : "minute"}
                        onSelect={(val) => setEndDateTime(val)}
                        confirmText={'OK'}
                        cancelText={'Cancel'}
                        min={startDateTime != null ? startDateTime : undefined}
                    />
                </Row>

                <StyledLabel >Other participants</StyledLabel>
                <StyledTextArea
                    placeholder="Email Email Email"
                    value={emailsInput}
                    onChange={event => setEmailsInput(event.target.value)}
                />
                <Button
                    style={{ margin: '10px auto', display: 'block' }}
                    color="primary"
                    onClick={handleCreate}
                >Create</Button>
                {/* <Button
                    style={{ margin: 'auto', display: 'block' }}
                    onClick={closeHandle}
                >Close</Button> */}
            </CenterColumn>
        </>
    );
}
