import { SpinLoading } from "antd-mobile";
import CenterContainer from "./CenterContainer";

export default function LoadingSpinnerFiller() {
    return (
        <CenterContainer $fill>
            <SpinLoading style={{ '--size': '48px'}} />
        </CenterContainer>
    );
}
