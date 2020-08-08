import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";

export default function MQuizList(props) {
    const { size } = props;
    const [quizList, setQuizList] = useState([]);
    const [hasRendered, setHasRendered] = useState(false);

    useEffect(() => {
        async function fetchQuizList(size) {
            return await fetch("/db/musiquiz/list/" + size)
                .then((res) => {
                    //console.log("RESPONSE ", res);
                    //TODO errorhanding
                    return res.json();
                })
                .then((data) => {
                    //console.log("DATA ", data);
                    setQuizList(data);
                });
        }

        fetchQuizList(size);
        setHasRendered(true);
    }, [hasRendered, size]);

    return (
        <ListGroup variant="flush">
            {quizList.map((q) => {
                return (
                    <ListGroup.Item key={q.name} action href={"/play/" + q._id}>
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
