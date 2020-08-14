import React, { useState } from "react";
import { Form, Alert, Button } from "react-bootstrap";
import { BsCloudDownload } from "react-icons/bs";
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
            <Form.Row
                style={{ display: "flex", justifyContent: "space-between" }}
            >
                <div style={{flexGrow:1,marginRight:"10px"}}>
                    <Form.Control
                        id="quizID"
                        value={quizId}
                        onChange={handleQuizIdChange}
                    ></Form.Control>
                </div>
                <Button
                    variant="primary"
                    disabled={quizId.length !== 24}
                    onClick={handleLookup}
                >
                    <BsCloudDownload />
                </Button>
            </Form.Row>
        </Form>
    );
}
