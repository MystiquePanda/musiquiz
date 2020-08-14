import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import "components/MQPlay";
import "components/MQCreate";

const MQMenu = (props) => {
    console.log("MQMenu ", props);

    return (
        <>
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
            </Col>
        </>
    );
};

export default MQMenu;
