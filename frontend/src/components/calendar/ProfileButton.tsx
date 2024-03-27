import { Button, CenterPopup, Toast } from "antd-mobile";
import { CheckOutline, CloseOutline, UserOutline } from "antd-mobile-icons";
import axios from "axios";
import { FC, useState } from "react";
import styled from "styled-components";
import refreshOnDemand from "../../helpers/refreshOnDemand";
import { useAppSelector } from "../../redux/store";
import { IUserInfo } from "../../types/auth";
import { LogoutButton } from "../common/LogoutButton";

export const ProfileButton: FC = () => {
    const user = useAppSelector(state => state.auth.user);

    const [show, setShow] = useState(false);
    const openProfile = () => setShow(true);
    const closeProfile = () => setShow(false);

    if (!user) return null;
    return (
        <>
            <Button onClick={openProfile} style={{ borderRadius: '6px' }}><UserOutline fontSize={24} />Profile</Button>
            <CenterPopup visible={show} onMaskClick={closeProfile}>
                <ProfileModalContent user={user} closeModal={closeProfile} />
            </CenterPopup>
        </>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;

    p {
        font-size: large;
        margin: 0px;
    }

`

const ProfileModalContent: FC<{ user: IUserInfo, closeModal?: VoidFunction }> = ({ user, closeModal }) => {

    const handleResend = async () => {
        try {
            await refreshOnDemand(() => axios.post('/user/verify-email'));
            Toast.show("An Email was send to " + user?.email);
        } catch (error) {
            Toast.show("Couldn't send an email");
        }
    }


    return (
        <>
            <Container>
                <p>Your login: {user?.login}</p>
                <p>Your email: {user?.email}</p>
                <p>Is email verified: {user?.emailVerified ? <CheckOutline color="green" /> : <CloseOutline color="red" />} {!user.emailVerified && <Button onClick={handleResend}>Resend Verification</Button>}</p>
                <LogoutButton />
                {closeModal && <Button onClick={closeModal}>Close</Button>}

            </Container>

        </>
    );
}
