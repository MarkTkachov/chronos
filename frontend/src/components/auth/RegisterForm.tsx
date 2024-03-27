import { Dialog } from "antd-mobile";
import axios, { AxiosError } from "axios";
import { FC, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components";
import emailRegex from '../../helpers/emailRegex';
import trimAllProperties from "../../helpers/trimAllProperties";
import { IRegisterData } from "../../types/auth";

const ErrorText = styled.p`
    margin: 0px;
    padding: 0px;
    text-align: center;
    font-size: small;
`


const RegisterForm: FC<{ closeRegister?: VoidFunction }> = ({ closeRegister = () => { } }) => {
    const { register, handleSubmit, reset, watch, formState: { isValid } } = useForm<IRegisterData>({
        mode: 'all',
        criteriaMode: 'all',
    })
    const [isLoading, setIsLoading] = useState(false);
    const pass1 = (watch('password') || '').trim();
    const pass2 = (watch('confirmPassword') || '').trim();

    const onSubmit: SubmitHandler<IRegisterData> = (inputs) => {
        const send = async () => {
            inputs = trimAllProperties(inputs);
            console.log(inputs);
            setIsLoading(true);
            try {
                const resp = await axios.post('/auth/register', inputs);
                Dialog.alert({ content: 'An email was set to your address for verification. Please follow the link in it', closeOnMaskClick: true, confirmText: 'OK'});
                closeRegister();
            } catch (error) {
                console.error(error);
                const data: { message?: string} = (error as AxiosError).response?.data as { message?: string};
                Dialog.alert({ content: data.message, closeOnMaskClick: true, confirmText: 'OK'});
            }
            setIsLoading(false);
            reset();
        }
        send();
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="chk" aria-hidden="true">Register</label>
                <input type="text"
                    placeholder="Login"
                    required
                    {...register('login', {
                        required: true
                    })}
                />
                <input type="email"
                    placeholder="Email"
                    required
                    {...register('email', {
                        required: true,
                        pattern: emailRegex
                    })}
                />
                <input type="password"
                    placeholder="Password"
                    required
                    {...register('password', {
                        required: true,
                        minLength: 8
                    })}
                />
                <input type="password"
                    placeholder="Password confirm"
                    required
                    {...register('confirmPassword', {
                        required: true,
                        minLength: 8
                    })}
                />
                {pass1 != pass2 && <ErrorText>Passwords must be identical</ErrorText>}
                {pass1.length < 8 && <ErrorText>Passwords must be at least 8 characters</ErrorText>}
                <button type="submit" disabled={!isValid || isLoading || (pass1 != pass2)}>Register</button>
            </form>
        </>
    );
}

export default RegisterForm;
