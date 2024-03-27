import { FC } from "react";
import styled from "styled-components";
import { Row } from "./Row";

const Svg = styled.img`
    display: block;
    width: 70px;

`

const Title = styled.span`
    font-size: x-large;
    font-weight: 600;
    font-style: italic;
`

export const Logo: FC = () => {
    return (
        <Row>
            <Svg src="/logo dark.svg" />
            <Title>Chronos</Title>
            
        </Row>

    );
}
