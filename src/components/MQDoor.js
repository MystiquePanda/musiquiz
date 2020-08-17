import React from "react";
import { Col, OverlayTrigger, Popover } from "react-bootstrap";
import MusicServices from "components/MusicServices";

const MusicServicePopover = (
    <Popover id="musicServiceLinkTooltip">
        <Popover.Content>
            {Object.keys(MusicServices).map((s) => {
                const ms = MusicServices[s];
                return (
                    <a key={s} href={ms.loginURL} style={{ color: ms.color }}>
                        <img
                            src={ms.logoSmall}
                            className="small-logo"
                            alt={s + " logo"}
                        />
                        Link {s} account to start
                    </a>
                );
            })}
        </Popover.Content>
    </Popover>
);

const MQDoor = () => (
    <Col xs={4}>
        <OverlayTrigger
            placement="bottom"
            delay={{ show: 0, hide: 10000 }}
            overlay={MusicServicePopover}
        >
            <img
                src="images/logo-musiQuiz.png"
                className="fit-to-container"
                alt="hover here"
            />
        </OverlayTrigger>
    </Col>
);

export default MQDoor;
