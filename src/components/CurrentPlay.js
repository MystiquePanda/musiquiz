import React, { useState } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import MusicServices from "components/MusicServices";

const TrackInfoDisplay = (props) => {
    return (
        <Form.Group as={Row} controlId={props.id} style={{ marginBottom: "0" }}>
            <Form.Label
                column
                sm="4"
                xs="4"
                style={{
                    textAlign: "right",
                    fontSize: "small",
                    margin: "auto",
                }}
            >
                {props.label}
            </Form.Label>
            <Form.Label column sm="8" xs="8" style={{ paddingBottom: "0px" }}>
                {props.value}
            </Form.Label>
        </Form.Group>
    );
};

const CurrentPlay = (props) => {
    const { musicService, onChange, music } = props;
    const [message, setMessage] = useState(props.message);

    const handleClick = () =>
        fetch(MusicServices[musicService].currentPlay)
            .then((res) => {
                if (!res.ok || res.status === 204) {
                    const s = res.status;
                    let m = "";
                    switch (s) {
                        case 401:
                            m = "refresh to continue";
                            break;
                        case 204:
                            m = "nothing is playing on spotify";
                            break;
                        default:
                            m = res.statusText;
                    }

                    throw new Error(m);
                }

                return res.json();
            })
            .then((data) => {
                console.debug("received data from music service: ", data);
                onChange(data);
            })
            .catch((err) => {
                console.error("need to handle error. ", err);
                setMessage({
                    variant: "danger",
                    msg: typeof err !== "string" ? err.toString() : err,
                });
            });

    //TODO show spinning while waiting for server/API

    return (
        <>
            {typeof message !== "undefined" ? (
                <Alert variant={message.variant}>{message.msg}</Alert>
            ) : undefined}
            <Button
                required
                disabled={props.disabled}
                className="btn"
                variant="primary"
                onClick={handleClick}
                style={{ float: "right" }}
            >
                {props.label}
            </Button>

            <div style={{ display: "flex" }}>
                <Col xs="3" className="album-art-col">
                    <img
                        src={music.artwork}
                        style={{
                            width: "100%",
                        }}
                    />
                </Col>
                <Col xs="9" style={{ display: "inline-block" }}>
                    <TrackInfoDisplay label="Track" value={music.track} />
                    <TrackInfoDisplay label="Album" value={music.album} />
                    <TrackInfoDisplay label="Artist" value={music.artist} />
                    <TrackInfoDisplay
                        label="Release"
                        value={music.releaseDate}
                    />
                </Col>
            </div>
        </>
    );
};

export default CurrentPlay;
