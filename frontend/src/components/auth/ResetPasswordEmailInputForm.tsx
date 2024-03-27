import { Dialog } from "antd-mobile";
import axios from "axios";
import { FC, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components";
import emailRegex from '../../helpers/emailRegex';
import CenterContainer from "../common/CenterContainer";

const Stack = styled.div`
    display: flex;
    flex-direction: column;
    /* gap: 10px; */
    align-items: center;
`

export const ResetPasswordEmailInputForm: FC<{ closeModal: VoidFunction }> = ({ closeModal }) => {
    const { register, handleSubmit, formState: { isValid } } = useForm<{ email: string }>({
        mode: 'all',
        criteriaMode: 'all',
    });
    const [isLoading, setIsLoading] = useState(false);

    const submitForgetPassword: SubmitHandler<{ email: string }> = (data) => {
        const send = async () => {
            try {
                setIsLoading(true);
                const resp = await axios.post('/auth/request-password-reset', data);
                Dialog.show({ content: 'A recovery link was sent to your email address', closeOnMaskClick: true });
                closeModal();

            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        }
        send();
    }

    return (
        <>
            <CenterContainer>
                <Stack>
                    <form onSubmit={handleSubmit(submitForgetPassword)}>
                        <h2 style={{ marginLeft: '20px' }}>Enter your email</h2>
                        <input type="text"
                            style={{ width: '300px', margin: '20px' }}
                            {...register('email', { required: true, pattern: emailRegex })}
                        />
                        <button type="submit" disabled={!isValid || isLoading}>Send Email</button>
                    </form>

                </Stack>

            </CenterContainer>
        </>
    );
}
