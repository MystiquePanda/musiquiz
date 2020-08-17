import React from "react";
import { Link } from "react-router-dom";
import { Col,Row } from "react-bootstrap";
import "components/MQPlay";
import "components/MQCreate";

const MQMenu = () => {
    return (
        <Row>
            <Col xs={1}/>
            <Col xs={4}>
                <Link to="/create">
                    <img
                        src="images/logo-musiQuiz-create.png"
                        alt="musiQuiz create logo"
                        className="fit-to-container"
                    />
                </Link>
            </Col>
            <Col xs={2}/>
            <Col xs={4}>
                <Link to="/play">
                    <img
                        src="images/logo-musiQuiz-play.png"
                        alt="musiQuiz Play logo"
                        className="fit-to-container"
                    />
                </Link>
            </Col>
            <Col xs={1}/>
        </Row>
    );
};

export default MQMenu;
