import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Modal, Form, Accordion, Button } from "react-bootstrap";
import MQCreateQuestionForm from "components/MQCreateQuestionForm";

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
        };
    }

    handleClose = () => {
        //TODO if in the middle warn first
        this.props.history.goBack();
    };

    handleQuestionAccordion = (e) => {
        this.setState({ activeQId: e });
    };

    handleQuestionUpdate = (i, k, v) => {
        console.log("parent need to update for ", i, ".", k, ": ", v);

        this.setState((prev) => ({
            quiz: {
                questions: prev.quiz.questions.map((q) => {
                    if (q.id === i) {
                        q[k] = v;
                    }
                    return q;
                }),
            },
        }));
    };

    allQuestionsCompleted = () => {
        return this.state.quiz.questions.every((q) => typeof q.response !== "undefined");
    };

    createQuestionList = (questions) => {
        return questions.map((q) => (
            <MQCreateQuestionForm
                key={q.id}
                id={q.id}
                question={q.question}
                answer={q.answer}
                level={q.level}
                musicService="spotify"
                setParentQuestion={(k, v) =>
                    this.handleQuestionUpdate(q.id, k, v)
                }
                handleAccordion={() => this.handleQuestionAccordion(q.id)}
            />
        ));
    };

    populateQuiz = (quiz) => {
        return (
            <>
                <Modal.Header
                    style={{ paddingBottom: "8px", paddingTop: "8px" }}
                >
                    <Modal.Title>{quiz.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleQuestionAdd}>
                        <Accordion activeKey={this.state.activeQId}>
                            {this.createQuestionList(quiz.questions)}
                        </Accordion>
                    </Form>
                </Modal.Body>
            </>
        );
    };

    handleSubmit = () => {
        console.log("submitted: ", this.state.quiz);
        const score = this.state.quiz.questions
            .map((q) => this.checkAnswer(q))
            .reduce((a, b) => a + b);
        alert(score + " / " + this.state.quiz.questions.length);
    };

    checkAnswer = (q) => {
        return q.level.every(
            (m) => JSON.stringify(q.response[m]) === JSON.stringify(q.answer[m])
        );
    };

    render() {
        const content =
            typeof this.state.quiz !== "undefined" ? (
                this.populateQuiz(this.state.quiz)
            ) : (
                <>
                    <Modal.Header
                        style={{ paddingBottom: "8px", paddingTop: "8px" }}
                    >
                        <Modal.Title>Pick a Quiz</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Find a Quiz from list:
                        <br />
                        <a href={this.props.location.pathname}>
                            {this.props.location.pathname}
                        </a>
                    </Modal.Body>
                </>
            );

        return (
            <>
                <Modal show onHide={this.handleClose} keyboard={false}>
                    {content}
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                        {typeof this.state.quiz === "undefined" ? undefined : (
                            <Button
                                variant="primary"
                                disabled={this.allQuestionsCompleted()}
                                onClick={this.handleSubmit}
                            >
                                Submit
                            </Button>
                        )}
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default withRouter(MQPlay);
