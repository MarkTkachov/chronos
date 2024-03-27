import { Button, Dialog, Toast } from "antd-mobile";
import axios from "axios";
import { FC, useState } from "react";
import emailRegex from '../../helpers/emailRegex';
import refreshOnDemand from "../../helpers/refreshOnDemand";
import { StyledLabel } from "../common/StyledLabel";
import { StyledTextArea } from "../common/StyledTextArea";

export const ShareCalendarForm: FC<{ id: string, closeHandle: VoidFunction }> = ({ id, closeHandle }) => {
    const [emailsInput, setEmailsInput] = useState('');


    const handleShare = async () => {
        if (emailsInput.trim().length === 0) return;
        const emails: string[] = emailsInput.split(' ').filter(val => val.trim().length !== 0);
        for (const email of emails) {
            if (!emailRegex.test(email)) {
                Toast.show(`Value ${email} is not valid email`);
                return;
            }
        }
        // console.log(emails);

        try {
            await refreshOnDemand(() => axios.post(`/calendar/${encodeURIComponent(id)}/share`, { participantsArray: emails.map(e => ({ email: e, role: 'editor' })) }));
            closeHandle();
        } catch (error) {
            Dialog.alert({ content: 'Error during sharing', confirmText: 'OK', closeOnMaskClick: true })
        }
    }

    return (
        <>
            <div>
                <StyledLabel style={{ textAlign: 'center' }} >Emails to share with &#40;space-separated&#41;:</StyledLabel>
                <StyledTextArea
                    autoFocus
                    placeholder="Email Email Email"
                    value={emailsInput}
                    onChange={event => setEmailsInput(event.target.value)}
                />
                <Button
                    style={{ margin: '20px auto', display: 'block' }}
                    color="primary"
                    onClick={handleShare}
                >Share</Button>
            </div>
        </>
    );
}
