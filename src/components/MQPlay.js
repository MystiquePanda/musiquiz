import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Modal } from "react-bootstrap";
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
        if (typeof quiz !== "undefined") {
            console.log("[MQPLAY] found quiz on the static context. ");
        }

        q =
            typeof quiz === "undefined" && props.data && props.data.quiz
                ? this.props.data.quiz
                : q;
        if (typeof quiz !== "undefined") {
            console.log("[MQPLAY] found quiz on props.data ");
        }

        this.state = {
            quiz: q,
            activeQId: 0,
            show: true,
        };
    }

    handleClose = () => {
        this.props.history.push("/");
    };

    render() {
        return (
            <div>
                <Modal show onHide={this.handleClose} keyboard={false}>
                    {typeof this.state.quiz !== "undefined" ? (
                        <MQuiz
                            quiz={this.state.quiz}
                            handleClose={this.handleClose}
                            musicService={this.props.musicService}
                        ></MQuiz>
                    ) : (
                        <MQuizPicker
                            size="5"
                            handleClose={this.handleClose}
                        ></MQuizPicker>
                    )}
                </Modal>
            </div>
        );
    }
}

export default withRouter(MQPlay);
