import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { withRouter } from "react-router-dom";

function MQuizList(props) {
    const { size, onQuizSelect, onError } = props;
    const [quizList, setQuizList] = useState([]);
    const [hasRendered, setHasRendered] = useState(false);

    useEffect(() => {
        async function fetchQuizList(size) {
            return await fetch("/db/musiquiz/list/" + size)
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    setQuizList(data);
                })
                .catch((e) => {
                    console.error(e);
                    onError({variant:"danger", msg: "Oops. Problem fetching quiz list. Refreh and try again."})
                });
        }

        fetchQuizList(size);
        setHasRendered(true);
    }, [hasRendered, size, onError]);

    return (
        <ListGroup variant="flush">
            {quizList.map((q) => {
                return (
                    <ListGroup.Item
                        key={q.name}
                        action
                        onClick={() => onQuizSelect(q._id)}
                    >
                        <img
                            src="/images/logo-musiQuiz.png"
                            style={{
                                width: "calc(2rem)",
                                marginRight: "calc(1rem)",
                            }}
                        />
                        {q.name}
                    </ListGroup.Item>
                );
            })}
        </ListGroup>
    );
}

export default withRouter(MQuizList);
