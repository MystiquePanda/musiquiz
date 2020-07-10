import React, { useState } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import MusicServices from "components/MusicServices";

const TrackInfoDisplay = (props) => {
    return (
        <Form.Group as={Row} controlId={props.id} style={{ marginBottom: "0" }}>
            <Form.Label column sm="3" xs="3" style={{ textAlign: "right" }}>
                {props.label}
            </Form.Label>
            <Form.Label column sm="9" xs="9">
                {props.value}
            </Form.Label>
        </Form.Group>
    );
};

const CurrentPlay = (props) => {
    const [data, setData] = useState({}); //TODO test content of data for required fields
    const [play, setPlay] = useState("");
    const [error, setError] = useState(undefined);

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
                setError(undefined);
                console.log("received data: ", data);

                setPlay(data);
                setData(data);
                props.updateParent(data);
            })
            .catch((err) => {
                console.log("need to handle error. ", err);
                setError({
                    variant: "danger",
                    msg: typeof err !== "string" ? err.toString() : err,
                });
            });
    };

    //TODO show spinning while waiting for server/API

    return (
        <>
            {error ? (
                <Alert variant={error.variant}>{error.msg}</Alert>
            ) : undefined}
            <Button
                required
                className="btn"
                variant="primary"
                onClick={handleClick}
                style={{ float: "right" }}
            >
                {props.label}
            </Button>
            <div>
                <TrackInfoDisplay label="Track" value={data.track} />
                <TrackInfoDisplay label="Album" value={data.album} />
                <TrackInfoDisplay label="Artist" value={data.artist} />
                <TrackInfoDisplay label="Release" value={data.releaseDate} />
            </div>
        </>
    );
};

export default CurrentPlay;
