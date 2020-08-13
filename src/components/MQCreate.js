import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Modal, Button, Accordion, Form } from "react-bootstrap";
import MQCreateQuestionForm from "components/MQCreateQuestionForm";
import MQCreateAddQuestion from "components/MQCreateAddQuestion";
import InplaceEditInput from "components/InplaceEditInput";
import Question from "components/Question";
import MQuizStyles from "components/MQuizStyles";

function generateRandomQuizName() {
    return "New Quiz";
}

class MQCreate extends Component {
    state = {
        questions: [Object.assign({}, Question.template)],
        description: "",
        quizName: generateRandomQuizName(),
        maxQNum: 10,
        nextQId: 1,
        activeQId: 0,
    };

    handleQuizNameChange = (e) => {
        this.setState({ quizName: e.target.value });
    };

    handleQuestionAdd = (e) => {
        e.preventDefault();
        const q = Object.assign({}, Question.template);
        q.id = this.state.nextQId;

        this.setState((prev) => ({
            questions: prev.questions.concat(q),
            nextQId: prev.nextQId + 1,
            activeQId: q.id,
        }));
    };

    handleQuestionUpdate = (i, k, v) => {
        console.log("parent need to update for ", i, ".", k, ": ", v);

        this.setState((prev) => ({
            questions: prev.questions.map((q) => {
                if (q.id === i) {
                    q[k] = v;
                }
                return q;
            }),
        }));
    };

    handleQuestionDelete = (i) => {
        console.log("delete id ", i, " from ", this.state.questions);

        this.setState((prev) => {
            const qs = prev.questions.filter((q) => q.id !== i);

            return {
                activeQId:
                    prev.activeQId === i
                        ? qs[qs.length - 1].id
                        : prev.activeQId,
                questions: qs,
            };
        });
    };

    handleSave = (e) => {
        const quiz = {
            name: this.state.quizName,
            questions: this.state.questions,
            created: new Date(),
        };

        const args = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            referrerPolicy: "no-referrer",
            body: JSON.stringify(quiz),
        };

        console.log("saving questions:", quiz);
        return fetch("/db/musiquiz/create/", args)
            .then((res) => {
                console.log(res);
                //TODO errorhanding
                return res.json();
            })
            .then((res) => {
                //TODO generate link and ask for email
                window.location.href = "/play/" + res.quizId;
            });
    };

    handleClose = () => {
        this.props.history.goBack();
    };

    handleQuestionAccordion = (e) => {
        this.setState({ activeQId: e });
    };

    lastQuestionCompleted = (q) => {
        return q.question.trim().length > 0 && Object.keys(q.answer).length > 0;
    };

    render() {
        const { maxQNum, quizName, questions } = this.state;

        const createQuestionList = () => {
            return questions.map((q) => (
                <MQCreateQuestionForm
                    editMode
                    key={q.id}
                    id={q.id}
                    question={q.question}
                    answer={q.answer}
                    level={q.level}
                    musicService="spotify"
                    handleQuestionDelete={this.handleQuestionDelete}
                    handleAccordion={() => this.handleQuestionAccordion(q.id)}
                    {...this.props}
                    setParentQuestion={(k, v) =>
                        this.handleQuestionUpdate(q.id, k, v)
                    }
                    enableDelete={questions.length > 1}
                />
            ));
        };

        return (
            <Modal show onHide={this.handleClose} keyboard={false}>
                <Modal.Header
                    style={{ paddingBottom: "8px", paddingTop: "8px" }}
                >
                    <Modal.Title>
                        <InplaceEditInput
                            value={quizName}
                            style={{
                                margin: "0px",
                                color: MQuizStyles.playColor,
                            }}
                            parentHandleChange={this.handleQuizNameChange}
                        ></InplaceEditInput>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleQuestionAdd}>
                        <Accordion activeKey={this.state.activeQId}>
                            {createQuestionList()}
                            <MQCreateAddQuestion
                                disableAdd={
                                    questions.length === maxQNum ||
                                    !this.lastQuestionCompleted(
                                        questions[questions.length - 1]
                                    )
                                }
                                errorMessage={
                                    questions.length === maxQNum
                                        ? "maximum number of questions reached"
                                        : undefined
                                }
                                musicService="spotify"
                            />
                        </Accordion>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        disabled={
                            !this.lastQuestionCompleted(
                                questions[questions.length - 1]
                            )
                        }
                        onClick={this.handleSave}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default withRouter(MQCreate);
