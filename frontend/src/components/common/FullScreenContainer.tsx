import { SafeArea } from "antd-mobile";
import { FC, ReactNode } from "react";
import styled from "styled-components";

const Container = styled.div<{ position?: string }>`
    display: block;
    position: ${props => props.position || 'static'};
    width: 100vw;
    width: 100dvw;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
`
const FullScreenContainer: FC<{position?: string, children?: ReactNode}> = ({position, children}) => {
    return (
        <Container position={position}>
            <SafeArea position="top" />
            {children}
            <SafeArea position="bottom" />
        </Container>
    );
}

export default FullScreenContainer;
