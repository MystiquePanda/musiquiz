import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Modal, Form, Accordion, Button } from "react-bootstrap";
import MQCreateQuestionForm from "components/MQCreateQuestionForm";

class MQPlay extends Component {
    state = {
        quiz: {},
        activeQId: 0,
    };

    handleClose = (e) => {
        //TODO if in the middle warn first
        this.props.history.goBack();
    };

    handleQuestionAccordion = (e) => {
        this.setState({ activeQId: e });
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

    render() {
        console.log("[MQPlay] PROPS ", this.props);

        // check static context first, if not then check 
        let quiz = this.staticContext && this.staticContext.data && this.staticContext.data.quiz ? quiz : undefined;
        if (typeof quiz !== "undefined"){
            console.log("[MQPLAY] found quiz on the static context. ")
        }
        
        quiz = typeof quiz === "undefined" && this.props.data && this. props.data.quiz ? this.props.data.quiz : quiz;
        if (typeof quiz !== "undefined"){
            console.log("[MQPLAY] found quiz on props.data ")
        }

        const content = typeof quiz !== "undefined" ? (
            this.populateQuiz(this.props.data.quiz)
        ) : (
            <>
                <Modal.Header
                    style={{ paddingBottom: "8px", paddingTop: "8px" }}
                >
                    <Modal.Title>Pick a Quiz</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Find a Quiz from list:<br/>
                    <a href={this.props.location.pathname}>{this.props.location.pathname}</a>
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
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default withRouter(MQPlay);
