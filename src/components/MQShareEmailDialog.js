import React from "react";
import { withRouter } from "react-router-dom";
import { ReactMultiEmail, isEmail } from "react-multi-email";
import "react-multi-email/style.css";
import { Modal, Form, Alert, Button } from "react-bootstrap";
import {
    BsFillEnvelopeFill,
    BsX,
    BsMusicNote,
    BsMusicNoteBeamed,
} from "react-icons/bs";

class MQShareEmailDialog extends React.Component {
    state = {
        emails: [],
        show: true,
        alert: undefined,
        sendToCreator: true,
    };

    handleClose = () => {
        this.setState({ show: false });
        this.props.history.push("/");
    };

    handleToggle = () => {
        this.setState((prev) => ({ sendToCreator: !prev.sendToCreator }));
    };

    handleQuizLaunch = () => {
        window.location.href = this.props.quiz.link;
    };

    canSend = () => {
        return this.state.sendToCreator || this.state.emails.length !== 0;
    };

    handleSend = async () => {
        const args = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
                emails: this.state.emails,
                message: this.props.quiz,
                sendToCreator: this.state.sendToCreator,
            }),
        };

        fetch("/mail/send", args)
            .then((res) => {
                if (!res.ok) {
                    throw Error();
                }
                this.handleClose();
            })
            .catch((e) => {
                this.setState({
                    alert: {
                        variant: "danger",
                        msg: "Error sending Email. Try again later",
                    },
                });
                console.error(e);
            });
    };

    render() {
        const { emails } = this.state;

        return (
            <Modal
                show={this.state.show}
                onHide={this.handleClose}
                keyboard={false}
            >
                <Modal.Header
                    style={{
                        paddingTop: "7px",
                        paddingBottom: "7px",
                        color: "white",
                        backgroundColor: "var(--create-color)",
                    }}
                >
                    <Modal.Title>Share the MusiQ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.state.alert && (
                        <Alert variant={this.state.alert.variant}>
                            {this.state.alert.msg}
                        </Alert>
                    )}
                    <Form.Group controlId="formBasicEmail">
                        <ReactMultiEmail
                            placeholder="Email Address"
                            emails={emails}
                            onChange={(_emails) => {
                                this.setState({ emails: _emails });
                            }}
                            validateEmail={(email) => isEmail(email)}
                            getLabel={(email, index, removeEmail) => (
                                <div data-tag key={index}>
                                    {email}
                                    <span
                                        data-tag-handle
                                        onClick={() => removeEmail(index)}
                                    >
                                        ×
                                    </span>
                                </div>
                            )}
                        />
                    </Form.Group>
                    <Form.Group controlId="formSendToCreator">
                        <Form.Check
                            type="checkbox"
                            label="Send a copy to me"
                            checked={this.state.sendToCreator}
                            onChange={this.handleToggle}
                        />
                    </Form.Group>
                    <Form.Group
                        className="align-items-center"
                        style={{ display: "flex" }}
                        controlId="formPlay"
                    >
                        <Button
                            className="flex-middle"
                            variant="secondary"
                            onClick={this.handleQuizLaunch}
                        >
                            <BsMusicNoteBeamed /> Take the new MusiQ out for a
                            spin <BsMusicNote />
                        </Button>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>
                        <BsX />
                    </Button>
                    <Button
                        disabled={!this.canSend()}
                        onClick={this.handleSend}
                    >
                        <BsFillEnvelopeFill />
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default withRouter(MQShareEmailDialog);
