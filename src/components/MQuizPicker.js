import React from "react";
import { Modal, Button } from "react-bootstrap";
import MQuizStyles from "components/MQuizStyles";
import MQuizLookupById from "components/MQuizLookupById";
import MQuizList from "components/MQuizList";

export default function MQuizPicker(props) {
    const { handleClose } = props;

    return (
        <>
            <Modal.Header
                style={{
                    paddingBottom: "8px",
                    paddingTop: "8px",
                    color: MQuizStyles.playColor,
                }}
            >
                <Modal.Title>Pick a Quiz</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <MQuizLookupById
                    onLoad={(quizId) =>
                        (window.location.href = "/play/" + quizId)
                    }
                />
                <div style={{ textAlign: "center", margin: "calc(1rem) auto" }}>
                    or
                </div>
                <div style={{ marginBottom: "calc(.5rem)" }}>
                    Play a recently created Quiz:
                </div>
                <MQuizList size={5} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </>
    );
}
