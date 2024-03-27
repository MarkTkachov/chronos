import styled from "styled-components";

export const ColorIndicator = styled.div<{ $color: string; }> `
    width: 50px;
    height: 50px;
    background-color: ${props => props.$color || 'inherit'};
    border-radius: 100000px;

`;
