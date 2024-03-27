import { CenterPopup, Dialog } from "antd-mobile";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components";
import trimAllProperties from "../../helpers/trimAllProperties";
import { fetchLoginAction } from "../../redux/authSlice";
import { useGetUserInfoQuery } from "../../redux/chronosAPI";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { ISignInData } from "../../types/auth";
import { ResetPasswordEmailInputForm } from "./ResetPasswordEmailInputForm";

const MyLink = styled.a`
    display: block;
    margin: auto;
    width: fit-content;
    text-align: center;
    text-decoration: underline;
    color: #1e3552;
    font-size: large;
    margin-top: 15px;
    cursor: auto;

`



export default function SignInForm() {
    const { register, handleSubmit, reset, formState: { isValid } } = useForm<ISignInData>({
        mode: 'all',
        criteriaMode: 'all',
    });
    const isLoading = useAppSelector(state => state?.auth?.status) == 'loading';
    const error = useAppSelector(state => state?.auth?.error);
    //makes silent login
    const { data, refetch } = useGetUserInfoQuery();
    const [showModal, setShowModal] = useState(false);
    const closeModal = () => setShowModal(false);
    const openModal = () => setShowModal(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (error) {
            Dialog.alert({ content: 'Error during login: Login/Email or password may be wrong', confirmText: 'OK'})
        }
    }, [error])


    const onSubmit: SubmitHandler<ISignInData> = (inputs) => {
        inputs = trimAllProperties(inputs);
        const send = async () => {
            dispatch(fetchLoginAction(inputs));
        }
        send();
    }



    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="chk" aria-hidden="true">Login</label>
                <input type="text"
                    placeholder="Email or Login"
                    required
                    {...register('loginOrEmail', {
                        required: true,
                        // pattern: emailRegex,
                    })}
                />
                <input type="password"
                    placeholder="Password"
                    required
                    {...register('password', {
                        required: true
                    })}
                />
                <button type="submit" disabled={!isValid || isLoading}>Sign in</button>

            </form>
            <MyLink onClick={openModal}>Forgot Password?</MyLink>
            <CenterPopup visible={showModal} onMaskClick={closeModal} >
                <ResetPasswordEmailInputForm closeModal={closeModal}/>

            </CenterPopup>
        </>
    );
}
