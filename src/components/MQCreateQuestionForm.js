import React, { useState } from "react";

import { Accordion, Form, Card } from "react-bootstrap";
import { BsTrashFill } from "react-icons/bs";
import CurrentPlay from "components/CurrentPlay";
import { GiSoundWaves } from "react-icons/gi";
import Question from "components/Question";
import MQuizStyles from "components/MQuizStyles";

const MQCreateQuestionForm = (props) => {
    const [question, setQuestion] = useState(props.question);
    const [matchLevel, setMatchLevel] = useState(props.level);
    const { id, enableDelete, musicService, handleAccordion } = props;
    const { editMode } = props;

    const handleQuestionChange = (e) => {
        const ele = e.target; 

        //use scroll top to determine if space is enough
        const t = ele.scrollTop; 
        ele.scrollTop = 0;
        if (t > 0) {
            ele.style.height = ele.offsetHeight + t + t + "px";
        }

        // update values
        setQuestion(ele.value);
        props.setParentQuestion("question", ele.value);
    };

    const handleDeleteQuestion = (e) => {
        e.stopPropagation();
        props.handleQuestionDelete(id);
    };

    const handleAnswerChange = (a) => {
        props.setParentQuestion(editMode ? "answer" : "response", a);
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
                style={{
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    background:
                        typeof props.background === "undefined"
                            ? editMode
                                ? MQuizStyles.createColor
                                : MQuizStyles.playColor
                            : props.background,
                }}
                onClick={handleAccordion}
            >
                {!editMode || question === ""
                    ? "Question " + (id + 1)
                    : question}
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
                        {editMode ? (
                            <Form.Control
                                name="question"
                                as="textarea"
                                rows="1"
                                required
                                value={question}
                                onChange={handleQuestionChange}
                            ></Form.Control>
                        ) : (
                            <div>{question}</div>
                        )}
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

                    {editMode && (
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
                                defaultValue={matchLevel.length}
                                min="1"
                                max="3"
                            />
                        </Form.Group>
                    )}
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
};

export default MQCreateQuestionForm;
