import { Button, DatePicker, Switch, Toast } from "antd-mobile";
import { FC, useEffect, useState } from "react";
import { IEvent } from "../../types/calendars";
import { CenterColumn } from "../common/CenterColumn";
import { Row } from "../common/Row";
import { StyledInputText } from "../common/StyledInputText";
import { StyledLabel } from "../common/StyledLabel";
import { StyledTextArea } from "../common/StyledTextArea";
import { ParticipantsList } from "./ParticipantsList";
import { Participant } from "./Participant";
import refreshOnDemand from "../../helpers/refreshOnDemand";
import axios from "axios";

const trimAndEmptyToUndef = (str: string | null | undefined) => {
    if (!str) return undefined;
    if (str.trim().length === 0) return undefined;
    return str.trim();
}

export const EditEventForm: FC<{ event: IEvent, refreshEvents: VoidFunction, closeHandle: VoidFunction }> = ({ event, refreshEvents, closeHandle }) => {
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description);
    const [location, setLocation] = useState(event.location);
    const [url, setUrl] = useState(event.addUrl);

    const [startDateTime, setStartDateTime] = useState<Date | null>(new Date(event.start));
    const [showStartSelector, setShowStartSelector] = useState(false);

    const [endDateTime, setEndDateTime] = useState<Date | null>(new Date(event.end ? event.end : event.start));
    const [showEndSelector, setShowEndSelector] = useState(false);

    const [allDay, setAllDay] = useState(event.allDay);

    const [participants, setParticipants] = useState(event.participants);
    

    useEffect(() => {
        if (!startDateTime || !endDateTime) return;
        if (startDateTime > endDateTime) setEndDateTime(new Date(startDateTime));
    }, [startDateTime, endDateTime]);


    const removeEmailCallback = (email: string) => {
        if (participants)
            return () => setParticipants(participants.filter((em => em != email)));
    }

    const handleSubmit = async () => {
        const patchBody = {
            title: trimAndEmptyToUndef(title),
            description: trimAndEmptyToUndef(description),
            location: trimAndEmptyToUndef(location),
            url: trimAndEmptyToUndef(url),
            startDateTime: startDateTime?.toISOString(),
            endDateTime: endDateTime?.toISOString(),
            participants: participants,
            allDay: allDay
        }
        if (!patchBody.title) {
            Toast.show('Title is required');
            return;
        }
        if (!patchBody.startDateTime) {
            Toast.show('Start Date is required');
            return;
        }
        if (!patchBody.endDateTime) {
            Toast.show('End Date is required');
            return;
        }
        try {
            await refreshOnDemand(() => axios.patch(`/calendar/edit-event/${encodeURIComponent(event.id)}`, patchBody));
            refreshEvents();
            closeHandle();
        } catch (error) {
            Toast.show(`Couldn't Edit Event`);
        }
    }


    return (
        <>
            <CenterColumn>
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

                
                {participants && participants.length != 0 && <>
                    <StyledLabel >Other participants</StyledLabel>
                    <ParticipantsList>
                        {participants.map(p => <Participant onClick={removeEmailCallback(p)} key={p}>{p}</Participant>)}
                    </ParticipantsList>
                </>}
                <Button
                    style={{ margin: '10px auto', display: 'block' }}
                    color="primary"
                    onClick={handleSubmit}
                >Edit</Button>
                {/* <Button
                    style={{ margin: 'auto', display: 'block' }}
                    onClick={closeHandle}
                >Close</Button> */}
            </CenterColumn>
        </>
    );
}
