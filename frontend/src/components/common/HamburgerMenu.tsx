import { FC, HTMLProps } from "react";
import styled from "styled-components";

const Svg = styled.img`
    display: block;
    width:50px;
    padding: 10px;
    box-sizing: border-box;

`

export const HamburgerMenu: FC<HTMLProps<HTMLImageElement>> = (props) => {
    return (
        <Svg {...props}  src="/hamburger.png"/>
    );
}
