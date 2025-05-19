import React, { useState} from 'react';
import '../styles/tooltip.css';

type TootltipWrapperProps = {
    children : React.ReactNode;
    message: string,
};

export function TooltipWrapper({ children, message }: TootltipWrapperProps) {
    const [visible, setVisible] = useState(false);

    return(
        <div
        className="tooltip-container"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        >
        {children}
        {visible && <div className="tooltip-box">{message}</div>}
        </div>
    );
}