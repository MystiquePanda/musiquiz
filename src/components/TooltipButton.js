import React from "react";
import { OverlayTrigger, Button, Tooltip } from "react-bootstrap";

export default function TooltipButton(props) {
    return props.tooltip ? (
        <OverlayTrigger
            overlay={<Tooltip id="tooltip">{props.tooltip}</Tooltip>}
            placement={props.placement}
        >
            <Button {...props}>{props.children}</Button>
        </OverlayTrigger>
    ) : (
        <Button {...props}>{props.children}</Button>
    );
}
