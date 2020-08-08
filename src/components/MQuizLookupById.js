import React, { useState } from "react";
import { Form, Col, Alert, Button } from "react-bootstrap";

export default function MQuizLookupById(props) {
    const { onLoad } = props;

    const [quizId, setQuizId] = useState("");
    const [message, setMessage] = useState(undefined);
    const handleQuizIdChange = (e) => setQuizId(e.target.value);

    const handleLookup = () => {
        //first check if the ID is valid
        fetch("/db/musiquiz/checkId/" + quizId)
            .then((res) => {
                console.log("Received  response from fetch: ", res);
                if (!res.ok || res.status === 204) {
                    const s = res.status;
                    let m = "";
                    switch (s) {
                        // TODO any special cases to handle?
                        default:
                            m = res.statusText;
                    }

                    throw new Error(m);
                }
                return res.json();
            })
            .then((data) => {
                data.valid
                    ? onLoad(quizId)
                    : setMessage({
                          variant: "danger",
                          msg:
                              "The Specified Quiz ID was not found. Check and try again. ",
                      });
            })
            .catch((err) => {
                console.log("need to handle error. ", err);
                setMessage({
                    variant: "danger",
                    msg: typeof err !== "string" ? err.toString() : err,
                });
            });
    };

    return (
        <Form>
            <Form.Row>
                {typeof message !== "undefined" && (
                    <Alert variant={message.variant}>{message.msg}</Alert>
                )}
            </Form.Row>
            <Form.Row>
                <Col xs={9}>
                    <Form.Control
                        id="quizID"
                        value={quizId}
                        onChange={handleQuizIdChange}
                    ></Form.Control>
                </Col>
                <Col xs={3}>
                    <Button
                        variant="primary"
                        disabled={quizId.length !== 24}
                        onClick={handleLookup}
                    >
                        Load
                    </Button>
                </Col>
            </Form.Row>
        </Form>
    );
}
