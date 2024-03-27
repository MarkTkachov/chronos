import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAppSelector } from "../../redux/store";
import RegisterForm from "./RegisterForm";
import SignInForm from "./SignInForm";


//https://codepen.io/mamislimen/pen/jOwwLvy

const Body = styled.div`
    margin: 0;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background: linear-gradient(to bottom, #008DDA, #41C9E2, #ACE2E1);
    .main{
        width: 350px;
        height: 500px;
        background: red;
        overflow: hidden;
        background: url("https://doc-08-2c-docs.googleusercontent.com/docs/securesc/68c90smiglihng9534mvqmq1946dmis5/fo0picsp1nhiucmc0l25s29respgpr4j/1631524275000/03522360960922298374/03522360960922298374/1Sx0jhdpEpnNIydS4rnN4kHSJtU1EyWka?e=view&authuser=0&nonce=gcrocepgbb17m&user=03522360960922298374&hash=tfhgbs86ka6divo3llbvp93mg4csvb38") no-repeat center/ cover;
        border-radius: 10px;
        box-shadow: 5px 20px 50px #000;
    }
    #chk{
        display: none;
    }
    .signup{
        position: relative;
        width:100%;
        height: 100%;
    }
    label{
        color: #fff;
        font-size: 2.3em;
        justify-content: center;
        display: flex;
        margin: 60px;
        margin-top: 15px;
        font-weight: bold;
        cursor: pointer;
        transition: .5s ease-in-out;
    }
    input{
        width: 60%;
        height: 20px;
        background: white;
        justify-content: center;
        display: flex;
        margin: 15px auto;
        padding: 10px;
        border: 1px solid gray;
        /* outline: red solid 3px; */
        border-radius: 5px;
    }
    button{
        width: 60%;
        height: 40px;
        margin: 10px auto;
        justify-content: center;
        display: block;
        color: #fff;
        background: #2d89e0;
        font-size: 1em;
        font-weight: bold;
        margin-top: 10px;
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
        background: #2d89e0;
    }
    .login{
        height: 500px;
        background: #eee;
        border-radius: 60% / 10%;
        transform: translateY(-100px);
        transition: .8s ease-in-out;
    }
    .login label{
        color: #008DDA;
        transform: scale(.6);
    }

    #chk:checked ~ .login{
        transform: translateY(-450px);
    }
    #chk:checked ~ .login label{
        transform: scale(1);	
    }
    #chk:checked ~ .signup label{
        transform: scale(.6);
    }

`




export default function LoginPage() {
    const isLoading = useAppSelector(state => state?.auth?.status) == 'loading';
    const user = useAppSelector(state => state?.auth?.user);
    const navigate = useNavigate();
    const chkRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) navigate('/');
    }, [user]);



    return (
        <>
            <Body>
                <div className="main">
                    <input type="checkbox" id="chk" ref={chkRef} aria-hidden="true" />

                    <div className="signup">
                        <SignInForm />
                    </div>

                    <div className="login">
                        <RegisterForm closeRegister={() => {
                            if (chkRef.current) {
                                chkRef.current.checked = false;
                            }
                        }} />
                    </div>

                </div>
            </Body>


        </>
    );
}
