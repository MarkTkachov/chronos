import { PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserInfoQuery } from "../../redux/chronosAPI";
import { useAppSelector } from "../../redux/store";
import FullScreenContainer from "./FullScreenContainer";
import LoadingSpinnerFiller from "./LoadingSpinnerFiller";


export default function LoginRequire(props: PropsWithChildren<object>) {
    const user = useAppSelector(state => state?.auth?.user);
    const { data, isLoading, error } = useGetUserInfoQuery();
    const navigate = useNavigate();
    // console.log(user);
    
    useEffect(() => {
        if (error && !user) navigate('/login');
    }, [user, error])


    const { children } = props;

    const LoadingScreen =
        <>
            <FullScreenContainer position="fixed">
                <LoadingSpinnerFiller />
            </FullScreenContainer>
        </>;


    return (
        <>
            {user ? children : LoadingScreen}
        </>

    );
}
