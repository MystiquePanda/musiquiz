import React from "react";
import { useHistory } from "react-router-dom";
import MQuizStyles from "components/MQuizStyles";
import MusicServices from "components/MusicServices";
import MusicServiceLink from "components/MusicServiceLink";
import { BsPeopleCircle } from "react-icons/bs";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";

const MQUserBar = (props) => {
    const history = useHistory();
    const { user, musicService } = props;

    const UserPopover = (
        <Popover id="userPopover">
            <Popover.Title as="h3">Hello! {" " + user.userName}</Popover.Title>

            <Popover.Content>
                powered by{" "}
                <img
                    src={MusicServices[musicService].logoSmall}
                    style={{
                        width: "20px",
                        height: "20px",
                        margin: "auto 10px",
                    }}
                ></img>
                <br />
                <Button
                    disabled
                    className="secondary"
                    style={{ margin: "auto" }}
                    onClick={() => {
                        MusicServiceLink.signout(() => history.push("/"));
                    }}
                >
                    log out
                </Button>
            </Popover.Content>
        </Popover>
    );

    return (
        <OverlayTrigger
            placement="bottom"
            delay={{ show: 0, hide: 3000 }}
            overlay={UserPopover}
        >
            <BsPeopleCircle
                style={{
                    color: MQuizStyles.playColor,
                    width: "30px",
                    height: "30px",
                    margin: "10px",
                }}
            />
        </OverlayTrigger>
    );
};

export default MQUserBar;
