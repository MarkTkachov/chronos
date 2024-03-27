import { FC, useState } from "react";
import { ICalendar } from "../../types/calendars";
import { CenterColumn } from "../common/CenterColumn";
import { StyledLabel } from "../common/StyledLabel";
import { StyledInputText } from "../common/StyledInputText";
import { Row } from "../common/Row";
import { HexColorPicker } from "react-colorful";
import { Button, Toast } from "antd-mobile";
import axios from "axios";
import { ColorIndicator } from "./ColorIndicator";

export const EditCalendarForm: FC<{
    cal: ICalendar,
    refreshCalendars: VoidFunction,
    closeForm: VoidFunction
}> = ({ cal, refreshCalendars, closeForm }) => {
    const [title, setTitle] = useState(cal.title);
    const [color, setColor] = useState(cal.color || '#3e9dfb');

    const handleEdit = async () => {
        if (title.trim().length === 0) {
            Toast.show("Title is required");
            return;
        }
        try {
            await axios.patch(`/calendar/${encodeURIComponent(cal._id)}`, {
                title,
                color
            });
            refreshCalendars();
            closeForm();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                Toast.show(error.response?.data.message);
            }
        }

    }

    return (
        <>
            <CenterColumn style={{gap: '10px'}}>
                <StyledLabel>Title</StyledLabel>
                <StyledInputText value={title} onChange={(e) => setTitle(e.target.value)} />
                <Row style={{ padding: '15px', justifyContent: 'space-around'}}>
                    <StyledLabel>Color</StyledLabel>
                    <ColorIndicator $color={color} />
                    <HexColorPicker color={color} onChange={val => setColor(val)} />
                </Row>
                <Button color="primary" onClick={handleEdit}>Edit</Button>
                {/* <Button onClick={closeForm}>Close</Button> */}
            </CenterColumn>
        </>
    );
}
