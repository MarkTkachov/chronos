import styled from "styled-components";

export const StyledInputText = styled.input.attrs(props => ({
    type: 'text'
}))`
    width: 300px;
    max-width: 80%;
    
    height: 20px;
    background: #e0dede;
    justify-content: center;
    display: flex;
    margin: auto;
    padding: 10px;
    border: none;
    outline: none;
    border-radius: 5px;
`
