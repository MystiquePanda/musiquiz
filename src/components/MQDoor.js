import React from "react";
import { Row, Col, OverlayTrigger, Popover } from "react-bootstrap";
import MusicServices from "components/MusicServices";

const MQDoor = (props) => {
    const service = "spotify";
    const ms = MusicServices[service];

    const MusicServicePopover = (
        <Popover id="musicServiceLinkTooltip">
            <Popover.Content>
                <a href={ms.loginURL} style={{ color: ms.color}}>
                    <img
                        src={ms.logoSmall}
                        alt={service + " logo"}
                        style={{
                            height: "40px",
                            width: "40px",
                            padding: "10px",
                        }}
                    />
                    Link {service} to start
                </a>
            </Popover.Content>
        </Popover>
    );

    return (
        <Row className="justify-content-center" style={{ margin: "auto" }}>
            <Col xs="4" style={{ padding: 0 }}>
                <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 0, hide: 10000 }}
                    overlay={MusicServicePopover}
                >
                    <img
                        alt="musiQuiz logo"
                        src="images/logo-musiQuiz.png"
                        style={{
                            padding: 0,
                            height: "100%",
                            width: "100%",
                        }}
                    />
                </OverlayTrigger>
            </Col>
        </Row>
    );
};

export default MQDoor;
