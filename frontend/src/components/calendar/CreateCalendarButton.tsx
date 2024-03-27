import { Button, CenterPopup, Modal, Tabs } from "antd-mobile";
import { AddOutline } from "antd-mobile-icons";
import axios from "axios";
import { FC, useState } from "react";
import { HexColorPicker } from "react-colorful";
import styled from "styled-components";
import { proxiedUrl } from "../../helpers/proxiedUrl";
import refreshOnDemand from "../../helpers/refreshOnDemand";
import { fetchAllCalendarsWithEvents } from "../../redux/calendarsSlice";
import { useAppDispatch } from "../../redux/store";
import { Row } from "../common/Row";
import { StyledInputText } from "../common/StyledInputText";
import { StyledLabel } from "../common/StyledLabel";
import { ColorIndicator } from "./ColorIndicator";

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    font-size: larger;
    font-weight: 600;
    cursor: pointer;
    margin: 10px auto;
`

export const CreateCalendarButton: FC<{ size?: number }> = ({ size = 36 }) => {
    const dispatch = useAppDispatch();
    const [showForm, setShowForm] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [color, setColor] = useState('#3e9dfb');

    const closeForm = () => setShowForm(false);

    const resetForm = () => {
        setTitle('');
        setUrl('');
    }

    const handleSendWithTitle = async () => {
        try {
            if (title.trim().length === 0) return;
            const resp = await refreshOnDemand(() => axios.post('/calendar', { title: title.trim(), color }));
            dispatch(fetchAllCalendarsWithEvents());
            resetForm();
            closeForm();
        } catch (error) {
            Modal.alert({ content: 'Could not create new calendar', closeOnMaskClick: true });
        }
    }

    const handleSendWithUrl = async () => {
        try {
            //stop if empty strings
            if (title.trim().length === 0 || url.trim().length === 0) return;
            try {
                const testUrl = await axios.get(proxiedUrl(url));
            } catch (error) {
                Modal.alert({ content: 'Given URL is unreachable, please input another URL', closeOnMaskClick: true });
                return;
            }

            const resp = await refreshOnDemand(() => axios.post('/calendar', { title: title.trim(), url: url.trim(), color }));
            dispatch(fetchAllCalendarsWithEvents());
            resetForm();
            closeForm();
        } catch (error) {
            Modal.alert({ content: 'Could not create new calendar', closeOnMaskClick: true });
        }
    }

    return (
        <>
            {/* button */}
            <ButtonContainer onClick={() => setShowForm(true)}>
                <AddOutline fontSize={size} />
                Add Calendar
            </ButtonContainer>

            {/* form */}
            <CenterPopup visible={showForm} onMaskClick={closeForm} showCloseButton onClose={closeForm}>
                <Tabs>
                    <Tabs.Tab title={'New calendar'} key={'new'}>
                        <StyledLabel>Calendar title</StyledLabel>
                        <StyledInputText
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                        <Row style={{ padding: '15px' }}>
                            <StyledLabel>Color</StyledLabel>
                            <ColorIndicator $color={color} />
                            <HexColorPicker color={color} onChange={val => setColor(val)} />
                        </Row>
                        <Button
                            style={{ margin: '10px auto', display: 'block' }}
                            color="primary"
                            onClick={handleSendWithTitle}>Create</Button>
                        <Button style={{ margin: 'auto', display: 'block' }} onClick={closeForm}>Close</Button>
                    </Tabs.Tab>
                    <Tabs.Tab title={'Import'} key={'import'}>
                        <StyledLabel>Calendar title</StyledLabel>
                        <StyledInputText
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                        <StyledLabel>URL to calendar in iCal format</StyledLabel>
                        <StyledInputText
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                        <Row style={{ padding: '15px' }}>
                            <StyledLabel>Color</StyledLabel>
                            <ColorIndicator $color={color} />
                            <HexColorPicker color={color} onChange={val => setColor(val)} />
                        </Row>
                        <Button
                            style={{ margin: '10px auto', display: 'block' }}
                            color="primary"
                            onClick={handleSendWithUrl}
                        >Import</Button>
                        {/* <Button style={{ margin: 'auto', display: 'block' }} onClick={closeForm}>Close</Button> */}
                    </Tabs.Tab>
                </Tabs>
            </CenterPopup>
        </>
    );
}
