import React, { useState } from "react";
import { Row, Container } from "react-bootstrap";

import MQDoor from "components/MQDoor";
import {
    ServerRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useHistory,
    useLocation,
} from "react-router-dom";


const MQuiz = (props) => {

    return (
        <Container
            style={{
                height: "95vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "row",
            }}
        >
            Logged in

        </Container>
    );
};

export default MQuiz;
