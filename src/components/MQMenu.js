import React from "react";
import PropTypes from "prop-types";
import { NavLink, Link } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import MusicServiceBar from "components/MusicServiceBar";
import "components/MQPlay";
import "components/MQCreate";

const MQMenu = (props) => {
    const musicService = props.musicService || "spotify";

    console.log("MQMenu ", props);

    return (
        <Row className="justify-content-center" style={{ margin: "auto" }}>
            <Col xs="4">
                <Link to="/create">
                    <img
                        src="images/logo-musiQuiz-create.png"
                        alt="musiQuiz create logo"
                        style={{
                            height: "100%",
                            width: "100%",
                            padding: "15%",
                        }}
                    />
                </Link>
            </Col>
            <Col xs="4">
                <Link to="/play">
                    <img
                        src="images/logo-musiQuiz-play.png"
                        alt="musiQuiz Play logo"
                        style={{
                            height: "100%",
                            width: "100%",
                            padding: "15%",
                        }}
                    />
                </Link>

                {/*<MusicServiceBar musicService={musicService} />*/}
            </Col>
        </Row>
    );
};

MQMenu.propTypes = {
    musicService: PropTypes.string,
};

export default MQMenu;
