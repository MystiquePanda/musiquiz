import React from "react";
import { useHistory } from "react-router-dom";
import MQuizStyles from "components/MQuizStyles";
import MusicServices from "components/MusicServices";
import MusicServiceLink from "components/MusicServiceLink";
import { FaRegUserCircle } from "react-icons/fa";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";

const MQUserBar = (props) => {
    const history = useHistory();
    const { user, musicService } = props;

    const UserPopover = (
        <Popover id="userPopover">
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
        <div
            style={{
                color: MQuizStyles.playColor,
            }}
        >
            <OverlayTrigger
                placement="bottom"
                delay={{ show: 0, hide: 10000 }}
                overlay={UserPopover}
            >
                <div>
                    <FaRegUserCircle style={{ marginRight: "10px" }} />
                    <label>{" " + user.userName}</label>
                </div>
            </OverlayTrigger>
        </div>
    );
};

export default MQUserBar;
