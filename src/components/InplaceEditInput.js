import React, { useState, useRef, useEffect } from "react";
import { Form } from "react-bootstrap";
import { GrEdit } from "react-icons/gr";

const InplaceEditInput = (props) => {
    const { value, style, parentHandleChange } = props;
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);

    const handleModeChange = () => {
        setEditing(!editing);
    };

    useEffect(() => {
        if (editing === true && inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing, inputRef]);

    const handleFocus = (e) => {
        e.target.select();
    };

    const handleKeyDown = (e) => {
        const { key } = e;
        const keys = ["Escape", "Tab"];
        const enterKey = "Enter";
        const allKeys = [...keys, enterKey]; // All keys array

        if (allKeys.indexOf(key) > -1) {
            setEditing(false);
        }

        if (key === "Escape") {
            e.preventDefault();

            console.log("swallowed escape");
        }
    };

    return (
        <>
            {editing ? (
                <Form.Control
                    id="input"
                    ref={inputRef}
                    value={value}
                    onChange={parentHandleChange}
                    style={style}
                    onBlur={() => setEditing(false)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    {...props.attributes}
                ></Form.Control>
            ) : (
                <>
                    <label style={style} onClick={handleModeChange}>
                        {value}
                    </label>{"  "}
                    <GrEdit style={{paddingBottom:"4%"}} onClick={handleModeChange} />
                </>
            )}
        </>
    );
};

export default InplaceEditInput;
