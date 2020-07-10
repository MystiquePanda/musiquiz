import axios from "axios";
import MusicServices from "components/MusicServices";

const MusicServiceLink = {
    isLinked: false,
    linkService: (serviceName, cb) => {
        console.log("Linking Music Service: %s ", serviceName);

        fetch(MusicServices[serviceName].loginURL, {
            method: 'GET',
            mode: "no-cors",
        })
            .then((res) => {
                if (res.url.includes("error=")) {
                    //TODO get actual error
                    throw new Error("Bad response from server");
                } else {
                    console.log("Successfully linked ", res);

                    MusicServiceLink.isLinked = true;
                    cb();
                }
            })
            .catch((error) => {
                MusicServiceLink.isLinked = false;
                console.log("[MusicServiceLink] ", error);
            });
    },
    unlink: (cb) => {
        //TODO implement
        MusicServiceLink.isLinked = false;
        setTimeout(cb, 100);
    },
};

export default MusicServiceLink;
