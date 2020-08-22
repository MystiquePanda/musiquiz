import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { BsCloudDownload } from "react-icons/bs";

function MQuizLookupById(props) {
    const { onLoad, onError } = props;

    const [quizId, setQuizId] = useState("");
    const handleQuizIdChange = (e) => setQuizId(e.target.value);

    const handleLookup = () => {
        //first check if the ID is valid
        fetch("/db/musiquiz/checkId/" + quizId)
            .then((res) => {
                console.debug("[MQuizLookupById] Verified quizID: ", res);
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
                    : onError({
                          variant: "danger",
                          msg:
                              "The Quiz ID was not found. Check and try again. ",
                      });
            })
            .catch((err) => {
                onError({
                    variant: "danger",
                    msg: typeof err !== "string" ? err.toString() : err,
                });
            });
    };

    return (
        <Form>
            <Form.Row
                style={{ display: "flex", justifyContent: "space-between" }}
            >
                <div style={{ flexGrow: 1, marginRight: "10px" }}>
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

export default MQuizLookupById;
