import React, { useState } from "react";

import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import { BsTrashFill } from "react-icons/bs";
import Form from "react-bootstrap/Form";
import CurrentPlay from "components/CurrentPlay";
import { GiSoundWaves } from "react-icons/gi";
import Question from "components/Question";

const MQCreateQuestionForm = (props) => {
    const [question, setQuestion] = useState(props.question);
    const [answer, setAnswer] = useState(props.answer);
    const [matchLevel, setMatchLevel] = useState(props.level);
    const { id, enableDelete, handleAccordion, musicService } = props;
    const { editMode } = props;

    const handleQuestionChange = (e) => {
        const q = e.target.value;
        setQuestion(q);
        props.setParentQuestion("question", q);
    };

    const handleDeleteQuestion = (e) => {
        e.stopPropagation();
        props.handleQuestionDelete(id);
    };

    const checkAnswer = (response, quizAnswer, matchLevel) => {
        return matchLevel.every((m) => {
            console.log(
                "Checking %s:%s",
                m,
                response[m] == quizAnswer[m],
                response[m],
                quizAnswer[m]
            );
            return JSON.stringify(response[m]) == JSON.stringify(quizAnswer[m]);
        });
    };

    const handleAnswerChange = (a) => {
        //TODO check validity of a
        if (editMode) {
            setAnswer(a);
            props.setParentQuestion("answer", a);
        } else {
            checkAnswer(a, answer, matchLevel)
                ? alert("correct!")
                : alert("wrong!");
        }

        console.log("answer: ", a);
    };

    const handleMatchLevelChange = (e) => {
        const l = Question.matchLevels.slice(0, e.target.value);
        setMatchLevel(l);
        props.setParentQuestion("level", l);
    };

    return (
        <Card>
            <Accordion.Toggle
                as={Card.Header}
                eventKey={id}
                style={{ paddingTop: "5px", paddingBottom: "5px" }}
                onClick={handleAccordion}
            >
                {question === "" ? "Question " + (id + 1) : question}
                {enableDelete && editMode ? (
                    <BsTrashFill
                        onClick={handleDeleteQuestion}
                        style={{
                            float: "right",
                            marginTop: "5px",
                        }}
                    />
                ) : undefined}
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={id}>
                <Card.Body>
                    <Form.Group controlId={"question" + id}>
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            name="question"
                            as="textarea"
                            rows="1"
                            required
                            readOnly={!editMode}
                            value={question}
                            onChange={handleQuestionChange}
                        ></Form.Control>
                    </Form.Group>

                    <Form.Group
                        controlId="answer"
                        style={{ marginBottom: "0px" }}
                    >
                        <Form.Label>
                            Answer
                            <Form.Text className="text-muted">
                                Play the answer on {musicService} then click on
                                record
                            </Form.Text>
                        </Form.Label>

                        <CurrentPlay
                            name="answer"
                            label={<GiSoundWaves />}
                            updateParent={handleAnswerChange}
                        />
                    </Form.Group>

                    {editMode ? (
                        <Form.Group
                            controlId="difficulty"
                            style={{ marginBottom: "0px" }}
                        >
                            <Form.Label>Match Level</Form.Label>
                            <Form.Text className="text-muted">
                                {matchLevel.toString()}
                            </Form.Text>
                            <Form.Control
                                readOnly={!editMode}
                                type="range"
                                custom
                                onChange={handleMatchLevelChange}
                                min="1"
                                defaultValue={matchLevel.length}
                                max="3"
                            />
                        </Form.Group>
                    ) : (
                        <></>
                    )}
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
};

export default MQCreateQuestionForm;
