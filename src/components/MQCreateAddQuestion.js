import React from "react";
import { Card, Button } from "react-bootstrap";
import { BsFillPlusCircleFill } from "react-icons/bs";

const MQCreateAddQuestion = (props) => {

    const handleClick = (e)=> {
        if ( props.disableAdd ){
            e.preventDefault();
        }
    }

    return (
        <Card>
            <Card.Header
                as={Button}
                type="submit"
                active
                style={{ textAlign: "center" }}
                onClick = {handleClick}
            >
                {props.errorMessage ? (
                    <label className="text-muted">
                        {props.errorMessage}
                    </label>
                ) : (
                    <BsFillPlusCircleFill className={props.disableAdd ? "text-muted":undefined}/>
                )}
            </Card.Header>
        </Card>
    );
};

export default MQCreateAddQuestion;
