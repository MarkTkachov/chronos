import { FC, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { IRestorePasswordData } from "../../types/auth";
import trimAllProperties from "../../helpers/trimAllProperties";
import axios from "axios";
import { Dialog } from "antd-mobile";

const Body = styled.div`
    margin: 0;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
    .main{
        width: 350px;
        height: 500px;
        background: red;
        overflow: hidden;
        background: url("https://doc-08-2c-docs.googleusercontent.com/docs/securesc/68c90smiglihng9534mvqmq1946dmis5/fo0picsp1nhiucmc0l25s29respgpr4j/1631524275000/03522360960922298374/03522360960922298374/1Sx0jhdpEpnNIydS4rnN4kHSJtU1EyWka?e=view&authuser=0&nonce=gcrocepgbb17m&user=03522360960922298374&hash=tfhgbs86ka6divo3llbvp93mg4csvb38") no-repeat center/ cover;
        border-radius: 10px;
        box-shadow: 5px 20px 50px #000;
    }
    h2 {
        color: #fff;
        font-size: 2.3em;
        justify-content: center;
        display: flex;
        margin-top: 25px;
        font-weight: bold;
    }
    p {
        color: #fff;
        font-size: large;
        text-align: center;
        justify-content: center;
        display: flex;
    }
    input{
        width: 60%;
        height: 20px;
        background: #e0dede;
        justify-content: center;
        display: flex;
        margin: 20px auto;
        padding: 10px;
        border: none;
        outline: none;
        border-radius: 5px;
    }
    button{
        width: 60%;
        height: 40px;
        margin: 10px auto;
        justify-content: center;
        display: block;
        color: #fff;
        background: #573b8a;
        font-size: 1em;
        font-weight: bold;
        margin-top: 20px;
        outline: none;
        border: none;
        border-radius: 5px;
        transition: .2s ease-in;
        cursor: pointer;

        &:disabled {
            background-color: gray;
            cursor: auto;

            &:hover {
                background-color: gray;
            }
        }
    }
    button:hover{
        background: #6d44b8;
    }
`
export const RestorePasswordPage: FC<object> = () => {
    const { token } = useParams();
    const { register, handleSubmit, watch, formState: { isValid } } = useForm<IRestorePasswordData>({
        mode: 'all',
        criteriaMode: 'all',
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const pass1 = (watch('newPassword') || '').trim();
    const pass2 = (watch('confirmPassword') || '').trim();

    const onSubmit: SubmitHandler<IRestorePasswordData> = (data) => {
        const send = async () => {
            setIsLoading(true);
            data = trimAllProperties(data);
            try {
                const resp = await axios.post('/auth/reset-password', data, { params: { token } });
                navigate('/login');
            } catch (error) {
                console.error(error);
                await Dialog.alert({ content: 'An error occured. Please try again', confirmText: 'OK' })

            }
            setIsLoading(false);
        }
        send();
    }

    return (
        <>
            <Body>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="main">
                        <h2>Reset Password</h2>
                        <p>New Password</p>
                        <input type="password"
                            placeholder="New Password"
                            {...register('newPassword', {
                                required: true,
                                minLength: 8
                            })}
                        />
                        <p>Confirm Password</p>
                        <input type="password"
                            placeholder="Confirm Password"
                            {...register('confirmPassword', {
                                required: true,
                                minLength: 8
                            })}
                        />
                        <button type="submit" disabled={!isValid || isLoading || (pass1 != pass2)}>Submit</button>


                    </div>
                </form>
            </Body>
        </>
    );
}
