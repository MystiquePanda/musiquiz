import React, { useState } from "react";
import { Form, Modal, Accordion, Button } from "react-bootstrap";
import MQuizStyles from "components/MQuizStyles.js";
import MQCreateQuestionForm from "components/MQCreateQuestionForm.js";
import MusicServices from "components/MusicServices";

export default function MQuiz(props) {
    const { handleClose } = props;
    const [activeQId, setActiveQId] = useState(0);
    const [score, setScore] = useState("");
    const [quiz, setQuiz] = useState(props.quiz);
    const [answeredAll, setAnsweredAll] = useState(false);
    const [checked, setChecked] = useState(false);
    const checkAnswer = (q) => {
        return q.level.every(
            (l) => JSON.stringify(q.response[l]) === JSON.stringify(q.answer[l])
        );
    };

    const handleSubmit = () => {
        setChecked(true);
        let score = 0;
        setQuiz((prev) => {
            prev.questions = prev.questions.map((q) => {
                q.correct = checkAnswer(q);
                score += q.correct;
                return q;
            });
            return prev;
        });

        //const score = nq.reduce((accu, curr) => accu + curr.correct, 0);
        setScore(score + " / " + quiz.questions.length);
    };

    const handlePlaylistCreation = () => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(quiz),
        };
        fetch(MusicServices["spotify"].createPlaylist, options)
            .then((r) => {
                if (r.ok) {
                    return r.json();
                }
            })
            .then((r) => {
                alert("created " + r.name + " at " + r.link);
            });
    };

    const handleQuestionUpdate = (i, k, v) => {
        console.log("[MQuiz] Questions update for ", i, ".", k, ": ", v);

        setQuiz((prev) => {
            prev.questions = prev.questions.map((q) => {
                if (q.id === i) {
                    q[k] = v;
                }
                return q;
            });
            return prev;
        });

        setAnsweredAll(
            quiz.questions.every((q) => typeof q.response !== "undefined")
        );
    };

    const allQuestionsCompleted = () => {
        console.log("All questions completed? ", quiz);
        return quiz.questions.every((q) => typeof q.response !== "undefined");
    };

    const createQuestionList = (questions) => {
        return questions.map((q) => (
            <MQCreateQuestionForm
                key={q.id}
                id={q.id}
                question={q.question}
                answer={q.answer}
                level={q.level}
                background={
                    typeof q.correct === "undefined"
                        ? "white"
                        : q.correct
                        ? MQuizStyles.green
                        : MQuizStyles.red
                }
                musicService="spotify"
                setParentQuestion={(k, v) => handleQuestionUpdate(q.id, k, v)}
                handleAccordion={() => setActiveQId(q.id)}
            />
        ));
    };

    return (
        <>
            <Modal.Header
                style={{
                    paddingBottom: "8px",
                    paddingTop: "8px",
                    color: MQuizStyles.playColor,
                }}
            >
                <Modal.Title>{quiz.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Accordion activeKey={activeQId}>
                        {createQuestionList(quiz.questions)}
                    </Accordion>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {checked && (
                    <>
                        <Button onClick={handlePlaylistCreation}>
                            Create Playlist
                        </Button>
                        <label style={{ float: "left" }}>
                            Correct: {score}
                        </label>
                    </>
                )}
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button
                    variant="primary"
                    disabled={!answeredAll}
                    onClick={handleSubmit}
                >
                    Check
                </Button>
            </Modal.Footer>
        </>
    );
}
