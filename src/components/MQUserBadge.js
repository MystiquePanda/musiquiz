import React from "react";
import MusicServices from "components/MusicServices";
import { BsPeopleCircle } from "react-icons/bs";
import { OverlayTrigger, Popover } from "react-bootstrap";

const MQUserBadge = (props) => {
    const { user, musicService } = props;
    const ms = MusicServices[musicService];

    const UserPopover = (
        <Popover id="userPopover" className="user-popover">
            <Popover.Title as="h3" className="popover-header play-font">
                Hello! {" " + user.userName}
            </Popover.Title>
            <Popover.Content>
                <a href="/logout" style={{ color: ms.color }}>
                    <img
                        src={ms.logoSmall}
                        alt={musicService + " logo"}
                        style={{
                            height: "40px",
                            width: "40px",
                            padding: "10px",
                        }}
                    ></img>
                    unlink {musicService}
                </a>
            </Popover.Content>
        </Popover>
    );

    return (
        <OverlayTrigger
            placement="bottom"
            delay={{ show: 0, hide: 300000 }}
            overlay={UserPopover}
        >
            <BsPeopleCircle className="user-badge" />
        </OverlayTrigger>
    );
};

export default MQUserBadge;
