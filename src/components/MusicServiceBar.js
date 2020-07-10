import React from "react";
import { useHistory } from "react-router-dom";
import MQuizStyles from "components/MQuizStyles";
import MusicServices from "components/MusicServices";
import MusicServiceLink from "components/MusicServiceLink";

const MusicServiceBar = (props) => {
    const history = useHistory();
    //const musicService = props.query.music_service;

    return (
        <div
            style={{
                float: "right",
                margin: "10px",
                color: MQuizStyles.playColor,
            }}
        >
            powered by{" "}
            <img
                src={MusicServices["spotify"].logoSmall}
                style={{
                    width: "20px",
                    height: "20px",
                    marginLeft: "10px",
                    marginRight: "10px",
                    marginTop: "auto",
                    marginBottom: "auto",
                }}
            ></img>
            <button
                onClick={() => {
                    MusicServiceLink.signout(() => history.push("/"));
                }}
            >
                Sign out
            </button>
        </div>
    );
};

export default MusicServiceBar;
