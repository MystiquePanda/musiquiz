import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Modal, Button, Accordion, Form } from "react-bootstrap";
import MQQuestionForm from "components/MQQuestionForm";
import MQAddQuestionButton from "components/MQAddQuestionButton";
import InplaceEditInput from "components/InplaceEditInput";
import Question from "components/Question";
import MQShareEmailDialog from "components/MQShareEmailDialog";
import { BsCloudUpload, BsX } from "react-icons/bs";

const generateRandomQuizName = () => {
    //TODO something like Docker's container name
    return "New Quiz";
};

class MQCreate extends Component {
    state = {
        questions: [Object.assign({}, Question.template)],
        description: "",
        quizName: generateRandomQuizName(),
        maxQNum: 10,
        nextQId: 1,
        activeQId: 0,
        musicService: this.props.musicService,
        show: true,
        shareQuiz: undefined,
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

    sendMail = async (mail) => {
        const args = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            referrerPolicy: "no-referrer",
            body: JSON.stringify(mail),
        };

        fetch("/mail/send", args)
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                return res;
            })
            .catch((e) => {
                //TODO errorhanding
            });
    };

    handleSave = () => {
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

        console.debug("saving questions:", quiz);
        return fetch("/db/musiquiz/create/", args)
            .then((res) => {
                return res.json();
            })
            .then(async (res) => {
                console.debug(`musiQ created /play/${res.quizId}`);
                this.setState({
                    shareQuiz: {
                        name: quiz.name,
                        link: "/play/" + res.quizId,
                    },
                });
            })
            .catch((e) => {
                //TODO errorhanding
            });
    };

    handleClose = () => {
        this.setState({ show: false });
        this.props.history.push("/");
    };

    handleQuestionAccordion = (e) => {
        this.setState({ activeQId: e });
    };

    questionCompleted = (q) => {
        return q.question.trim().length > 0 && Object.keys(q.answer).length > 0;
    };

    MQQuestionList = () => (
        <>
            {this.state.questions.map((q) => (
                <MQQuestionForm
                    editMode
                    key={q.id}
                    id={q.id}
                    question={q.question}
                    answer={q.answer}
                    level={q.level}
                    musicService={this.state.musicService}
                    onQuestionDelete={this.handleQuestionDelete}
                    onAccordionClick={() => this.handleQuestionAccordion(q.id)}
                    {...this.props}
                    onQuestionChange={(k, v) =>
                        this.handleQuestionUpdate(q.id, k, v)
                    }
                    enableDelete={this.state.questions.length > 1}
                />
            ))}
        </>
    );

    render() {
        const { maxQNum, quizName, questions, musicService } = this.state;
        const isFull = questions.length === maxQNum;
        const lastQuestionCompleted = this.questionCompleted(
            questions[questions.length - 1]
        );

        return typeof this.state.shareQuiz !== "undefined" ? (
            <MQShareEmailDialog
                quiz={this.state.shareQuiz}
            ></MQShareEmailDialog>
        ) : (
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
                    <Modal.Title>
                        <InplaceEditInput
                            value={quizName}
                            onChange={this.handleQuizNameChange}
                        ></InplaceEditInput>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.handleQuestionAdd}>
                        <Accordion activeKey={this.state.activeQId.toString()}>
                            {this.MQQuestionList()}
                            <MQAddQuestionButton
                                disableAdd={isFull || !lastQuestionCompleted}
                                errorMessage={
                                    isFull
                                        ? "maximum number of questions reached"
                                        : undefined
                                }
                                musicService={musicService}
                            />
                        </Accordion>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>
                        <BsX />
                    </Button>
                    <Button
                        variant="primary"
                        disabled={!lastQuestionCompleted}
                        onClick={this.handleSave}
                    >
                        <BsCloudUpload />
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default withRouter(MQCreate);
