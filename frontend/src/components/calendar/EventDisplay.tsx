import { Button, Dialog, Modal, Toast } from "antd-mobile";
import axios from "axios";
import { FC } from "react";
import styled from "styled-components";
import refreshOnDemand from "../../helpers/refreshOnDemand";
import { IEvent } from "../../types/calendars";
import { Row } from "../common/Row";
import { EditEventForm } from "./EditEventForm";
import { Participant } from "./Participant";
import { ParticipantsList } from "./ParticipantsList";
import { ShareEventForm } from "./ShareEventForm";

const Container = styled.div`
    display: flex;
    /* padding: 0px; */
    gap: 5px;
    flex-direction: column;
`

const Label = styled.p`
    margin: 0px;
    padding: 0px;
    font-weight: 600;
`

const Text = styled.p`
    margin: 3px;
    padding: 0px;
`

const LeftRow = styled(Row)`
    justify-content: flex-start;
`

export const EventDisplay: FC<{
    eventObj: IEvent,
    closeHandle: VoidFunction,
    eventsRefetch: VoidFunction
}> = ({ eventObj, closeHandle, eventsRefetch }) => {


    const handleEdit = () => {
        const modalHandle = Modal.show({
            content: <EditEventForm
                event={eventObj}
                refreshEvents={eventsRefetch}
                closeHandle={() => {
                    closeHandle();
                    modalHandle.close();
                }}
            />,
            closeOnMaskClick: true,
            showCloseButton: true
        })
    }

    const handleShare = () => {
        const modalHandle = Modal.show({
            content: <ShareEventForm
                id={eventObj.id}
                closeHandle={() => {
                    modalHandle.close();
                }}
            />,
            closeOnMaskClick: true,
            showCloseButton: true
        })
    }

    const handleDelete = () => {
        Dialog.confirm({
            cancelText: 'Cancel',
            confirmText: 'Confirm',
            content: `Are you sure to delete ${eventObj.title}?`,
            onConfirm: async () => {
                try {
                    await refreshOnDemand(() => axios.delete(`/calendar/delete-event/${encodeURIComponent(eventObj.id)}`));
                    eventsRefetch();
                    closeHandle();
                } catch (error) {
                    Toast.show(`Couldn't delete the event`);
                }
            }
        })
    }

    return (
        <>
            <Container>
                {/* title */}
                <h2>{eventObj.title}</h2>
                {/* time */}
                {eventObj.allDay
                    ? <Text>{new Date(eventObj.start).toLocaleDateString()} - {eventObj.end ? new Date(eventObj.end).toLocaleDateString() : ''}</Text>
                    : <Text>{new Date(eventObj.start).toLocaleString()} - {eventObj.end ? new Date(eventObj.end).toLocaleString() : ''}</Text>}

                {/* url */}

                {eventObj.addUrl &&
                    <>
                        <LeftRow>
                            <Label>Link</Label>
                            <Text><a href={eventObj.addUrl}>{eventObj.addUrl}</a></Text>
                        </LeftRow>

                    </>
                }
                {/* location */}
                {eventObj.location &&
                    <>
                        <LeftRow>
                            <Label>Location</Label>
                            <Text>{eventObj.location}</Text>
                        </LeftRow>

                    </>
                }
                {/* description */}
                {eventObj.description &&
                    <>
                        <Label>Description</Label>
                        <Text>{eventObj.description}</Text>
                    </>
                }
                {eventObj.participants && eventObj.participants.length != 0 &&
                    <>
                        <Label>Other participants</Label>
                        <ParticipantsList>
                            {eventObj.participants.map(email => <Participant key={email}>{email}</Participant>)}
                        </ParticipantsList>
                    </>}
                {/* controls */}
                {eventObj.calendarType == 'local' &&
                    <>
                        {(eventObj.role == 'creator' || eventObj.role == 'editor') && <Button color="primary" onClick={handleEdit}>Edit</Button>}
                        {(eventObj.role == 'creator') && <Button color="success" onClick={handleShare}>Share</Button>}
                        {(eventObj.role == 'creator') && <Button color="danger" onClick={handleDelete}>Delete</Button>}
                    </>

                }
            </Container>

        </>
    );
}
