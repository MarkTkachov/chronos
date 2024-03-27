import { Popover } from "antd-mobile";
import { FC } from "react";
import styled from "styled-components";

const GridContainer = styled.div<{ $color?: string }>`
    box-sizing: border-box;
    padding: 17px;

    color: black;
    font-size: large;


    display: grid;
    grid-template-columns: 40px auto 40px;
    grid-template-rows: auto;
    grid-template-areas: "check title options";
    align-items: center;

    & .check {
        justify-self: start;
        grid-area: check;
        accent-color: ${props => props.$color || 'blue'};
        
        input {
            height: 20px;
            width: 20px;
        }
    }

    & .title {
        justify-self: start;
        grid-area: title;
        overflow-x: scroll;
        overflow-y: hidden;

        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    & .options {
        justify-self: end;
        grid-area: options;
    }
`


export const HolidaySelector: FC<{ selected: boolean, onChange: VoidFunction }> = ({ selected, onChange }) => {
    return (
        <>
        <GridContainer>
                <span className="check">
                    <input type="checkbox" checked={selected} onChange={onChange} />
                </span>
                <span className="title">
                    Holidays
                </span>
                <span className="options">
                    

                </span>

            </GridContainer>
        </>
    );
}
