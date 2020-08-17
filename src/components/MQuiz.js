import React, { useState } from "react";
import { Form, Modal, Accordion, Button, Alert } from "react-bootstrap";
import MQQuestionForm from "components/MQQuestionForm.js";
import MusicServices from "components/MusicServices";
import TooltipButton from "components/TooltipButton";
import { BsMusicNoteList, BsX, BsCheckCircle } from "react-icons/bs";

export default function MQuiz(props) {
    const { handleClose, musicService, quiz } = props;
    const [activeQId, setActiveQId] = useState(0);
    const [questions, setQuestions] = useState(quiz.questions);
    const [answeredAll, setAnsweredAll] = useState(false);
    const [checked, setChecked] = useState(false);
    const [playlist, setPlaylist] = useState(undefined);

    const checkAnswer = (q) => {
        return q.level.every(
            (l) => JSON.stringify(q.response[l]) === JSON.stringify(q.answer[l])
        );
    };

    const handleSubmit = () => {
        setChecked(true);
        setQuestions((prev) =>
            prev.map((q) => {
                q.correct = checkAnswer(q);
                return q;
            })
        );
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
                setPlaylist({
                    name: r.name,
                    uri: r.link,
                    header: "Wohoo!",
                    body:
                        "Playlist " +
                        r.name +
                        " has been created for you. enjoy!",
                    footer: (
                        <Alert.Link href={r.link} target="_blank">
                            Open playlist
                        </Alert.Link>
                    ),
                });
            })
            .catch((e) => {
                console.error("failed to create playlist", e);
                setPlaylist({
                    error: e,
                    header: "This is embarassing...",
                    body:
                        "Looks like there was an issue creating playlist.Hopefully someone will look into it.",
                    footer: undefined,
                });
            });
    };

    const handleQuestionUpdate = (i, k, v) => {
        console.debug("[MQuiz] Questions update for ", i, ".", k, ": ", v);

        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id === i) {
                    q[k] = v;
                }
                return q;
            })
        );

        setAnsweredAll(
            questions.every((q) => typeof q.response !== "undefined")
        );

        console.debug(questions);
    };

    const MQQuestionList = () => (
        <>
            {questions.map((q) => {
                console.log(q.response || {});
                return (
                    <MQQuestionForm
                        key={q.id}
                        id={q.id}
                        question={q.question}
                        answer={q.response || {}}
                        background={
                            typeof q.correct === "undefined"
                                ? undefined
                                : q.correct
                                ? "var(--mq-green)"
                                : "var(--mq-red)"
                        }
                        musicService={musicService}
                        setParentQuestion={(k, v) =>
                            handleQuestionUpdate(q.id, k, v)
                        }
                        onAccordionClick={() => setActiveQId(q.id)}
                    />
                );
            })}
        </>
    );

    return (
        <>
            <Modal.Header
                style={{
                    paddingTop: "7px",
                    paddingBottom: "7px",
                    color: "white",
                    backgroundColor: "var(--play-color)",
                }}
            >
                <Modal.Title>{quiz.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Accordion activeKey={activeQId.toString()}>
                        <MQQuestionList />
                    </Accordion>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {typeof playlist !== "undefined" && (
                    <Alert
                        key="playlistAlert"
                        variant={playlist.error ? "danger" : "info"}
                        style={{ width: "100%" }}
                    >
                        <Alert.Heading>{playlist.header}</Alert.Heading>
                        <p>{playlist.body}</p>
                        <p className="mb-0">{playlist.footer}</p>
                    </Alert>
                )}

                {checked && (
                    <>
                        <TooltipButton
                            onClick={handlePlaylistCreation}
                            style={{ marginRight: "auto" }}
                            tooltip={"create answer playlist"}
                            placement="bottom"
                        >
                            <BsMusicNoteList />
                        </TooltipButton>

                        <label>
                            score:
                            {questions.reduce((accu, c) => accu + c.correct, 0)}
                            /{questions.length}
                        </label>
                    </>
                )}

                <Button variant="secondary" onClick={handleClose}>
                    <BsX />
                </Button>
                <Button
                    variant="primary"
                    disabled={!answeredAll}
                    onClick={handleSubmit}
                >
                    <BsCheckCircle />
                </Button>
            </Modal.Footer>
        </>
    );
}
