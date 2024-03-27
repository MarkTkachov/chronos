import styled from "styled-components";

export default styled.div<{ $fill?: boolean; }>`
    display: flex;
    justify-content: center;
	align-items: center;
    width: ${props => props.$fill ? '100%' : 'auto'};
    height: ${props => props.$fill ? '100%' : 'auto'};
`
