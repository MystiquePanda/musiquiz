import React from "react";
import { Modal, Button } from "react-bootstrap";
import MQuizLookupById from "components/MQuizLookupById";
import MQuizList from "components/MQuizList";
import { BsX } from "react-icons/bs";

function MQuizPicker(props) {
    const { handleClose, onQuizSelect, onError } = props;

    return (
        <>
            <Modal.Body>
                <MQuizLookupById onLoad={onQuizSelect} onError={onError} />
                <div style={{ textAlign: "center", margin: "calc(1rem) auto" }}>
                    or
                </div>
                <div style={{ marginBottom: "calc(.5rem)" }}>
                    Play a recently created Quiz:
                </div>
                <MQuizList
                    size={5}
                    onQuizSelect={onQuizSelect}
                    onError={onError}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    <BsX />
                </Button>
            </Modal.Footer>
        </>
    );
}

export default MQuizPicker;
