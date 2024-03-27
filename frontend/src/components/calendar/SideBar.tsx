import styled from "styled-components";



export const SideBar = styled.aside<{ $collapse?: boolean }>`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    gap: 5px;

    background-color: white;
    border-right: 1px solid lightgray;

    /* padding: 10px; */
    width: 300px;
    height: calc(100% - 80px);
    position: absolute;
    left: ${props => props.$collapse ? '-300px' : '0px'};

    overflow-y: auto;
    //padding-top: 100px;
    transition: left 500ms cubic-bezier(0.65, 0, 0.35, 1) 0s;
    z-index: 30;
    @media screen and (max-width: 800px){
        width: 70dvw;
        left: ${props => props.$collapse ? '-70dvw' : '0px'};
    }
`
