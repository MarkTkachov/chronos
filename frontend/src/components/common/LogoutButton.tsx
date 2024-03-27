import { Button } from "antd-mobile";
import { useAppDispatch } from "../../redux/store";
import { fetchLogoutAction } from "../../redux/authSlice";
import { FC } from "react";

export const LogoutButton: FC = () => {
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(fetchLogoutAction());
    }

    return (
        <>
            <Button color="danger" onClick={handleClick}>Logout</Button>
        </>
    );
}
