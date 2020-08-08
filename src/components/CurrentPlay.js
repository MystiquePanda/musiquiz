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
    const [data, setData] = useState({}); //TODO test content of data for required fields
    const [message, setMessage] = useState(props.message);

    const handleClick = () => {
        //TODO axios prob can build query string
        fetch(MusicServices["spotify"].currentPlay)
            .then((res) => {
                console.log(res);
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
                setMessage(undefined);
                console.log("received data from music service: ", data);

                setData(data);
                props.updateParent(data);
            })
            .catch((err) => {
                console.log("need to handle error. ", err);
                setMessage({
                    variant: "danger",
                    msg: typeof err !== "string" ? err.toString() : err,
                });
            });
    };

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
                <Col
                    xs="3"
                    style={{
                        display: "inline-block",
                        padding: "calc(.375rem + 1px) 0px",
                        alignSelf: "center",
                    }}
                >
                    <img
                        src={data.artwork}
                        style={{
                            width: "100%",
                        }}
                    />
                </Col>
                <Col xs="9" style={{ display: "inline-block" }}>
                    <TrackInfoDisplay label="Track" value={data.track} />
                    <TrackInfoDisplay label="Album" value={data.album} />
                    <TrackInfoDisplay label="Artist" value={data.artist} />
                    <TrackInfoDisplay
                        label="Release"
                        value={data.releaseDate}
                    />
                </Col>
            </div>
        </>
    );
};

export default CurrentPlay;
