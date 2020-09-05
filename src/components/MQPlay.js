import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Modal, Alert } from "react-bootstrap";
import MQuizPicker from "components/MQuizPicker";
import MQuiz from "components/MQuiz";

class MQPlay extends Component {
    constructor(props) {
        super(props);

        // check static context first, if not then check
        let q =
            this.staticContext &&
            this.staticContext.data &&
            this.staticContext.data.quiz
                ? this.staticContext.data.quiz
                : undefined;
        if (typeof q !== "undefined") {
            console.debug("[MQPLAY] found quiz on the static context. ");
        }

        q =
            typeof quiz === "undefined" && props.data && props.data.quiz
                ? this.props.data.quiz
                : q;
        if (typeof q !== "undefined") {
            console.debug("[MQPLAY] found quiz on props.data ");
        }

        this.state = {
            quiz: q,
            activeQId: 0,
            show: true,
            error: undefined,
            title: typeof q === "undefined" ? "Pick a Quiz" : q.name,
        };
    }

    handleQuizLoad = async (quizId) => {
        const quiz = await fetch("/db/musiquiz/read/" + quizId)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                return data.quiz;
            })
            .catch((e) => {
                console.error(e);
                //TODO
            });

        this.setState({ quiz, title: quiz.name, error: undefined });
    };

    handleClose = () => {
        this.props.onQuizReset && this.props.onQuizReset();
        this.props.history.push("/");
    };

    render() {
        return (
            <div>
                <Modal show onHide={this.handleClose} keyboard={false}>
                    <Modal.Header
                        style={{
                            paddingTop: "7px",
                            paddingBottom: "7px",
                            color: "white",
                            backgroundColor: "var(--play-color)",
                        }}
                    >
                        <Modal.Title>{this.state.title}</Modal.Title>
                    </Modal.Header>
                    {typeof this.state.error !== "undefined" && (
                        <Alert
                            style={{ width: "100%" }}
                            variant={this.state.error.variant}
                        >
                            {this.state.error.msg}
                        </Alert>
                    )}
                    {typeof this.state.quiz !== "undefined" ? (
                        <MQuiz
                            visible={typeof this.state.quiz !== "undefined"}
                            quiz={this.state.quiz}
                            handleClose={this.handleClose}
                            musicService={this.props.musicService}
                        ></MQuiz>
                    ) : (
                        <MQuizPicker
                            size="5"
                            handleClose={this.handleClose}
                            onQuizSelect={this.handleQuizLoad}
                            onError={(e) => {
                                this.setState({ error: e });
                            }}
                        ></MQuizPicker>
                    )}
                </Modal>
            </div>
        );
    }
}

export default withRouter(MQPlay);
