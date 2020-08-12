import config from "server/config";
import express from "express";
import request from "request";
import querystring from "querystring";
import fetch from "node-fetch";
const router = express.Router();

const auth_callback_uri = config.baseURI + "/spotify/logincb";
const spotify_base_uri = "https://accounts.spotify.com";
const spotify_auth_uri = spotify_base_uri + "/authorize?";
const spotify_api_token_uri = spotify_base_uri + "/api/token";
const spotify_api_uri = "https://api.spotify.com/v1";
const state_key = "spotify_auth_state";

const generateRandomString = function (length) {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

function loginHandler(req, res) {
    const state = generateRandomString(16);
    console.log("[SPOTIFY] login:state:%s > %s", state_key, state);
    res.cookie(state_key, state);

    const scope =
        "playlist-modify-private user-read-currently-playing user-read-playback-state streaming user-read-email user-read-private";

    res.redirect(
        spotify_auth_uri +
            querystring.stringify({
                response_type: "code",
                client_id: config.spotifyClient,
                scope: scope,
                redirect_uri: auth_callback_uri,
                state: state,
            })
    );
}

function loginCbHandler(req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[state_key] : null;

    console.log("[SPOTIFY] logincb:state:%s > %s", state_key, state);
    console.log(
        "[SPOTIFY] logincb:storedState:%s > %s",
        state_key,
        storedState
    );

    if (state === null || state !== storedState) {
        //TODO handle this error on UI side
        res.redirect(
            "/door?" +
                querystring.stringify({
                    error: "state_mismatch",
                })
        );
    } else {
        res.clearCookie(state_key);
        console.debug("[SPOTIFY] logging in using returned code ", code);

        const params = new URLSearchParams();
        params.append("code", code);
        params.append("redirect_uri", auth_callback_uri);
        params.append("grant_type", "authorization_code");

        const authOptions = {
            method: "POST",
            headers: {
                Authorization:
                    "Basic " +
                    Buffer.from(
                        config.spotifyClient + ":" + config.spotifySecret
                    ).toString("base64"),
            },
            body: params,
            compress: true,
        };

        fetch(spotify_api_token_uri, authOptions)
            .then((r) => {
                if (r.ok) {
                    return r.json();
                }
                throw new Error(
                    "Error fetching access token. " +
                        r.status +
                        ":" +
                        r.statusText
                );
            })
            .then(async (r) => {
                setMusicServiceAccess(r, req);
                const user = await fetchMusciServiceAccount(req.session);
                console.log("[SPOTIFY] received user info: ", user);
                setMusicServiceUser(user, req);
                res.redirect("/");
            })
            .catch((e) => {
                console.log("Caught error", e);
                res.redirect(
                    "/door?" +
                        querystring.stringify({
                            error: e,
                        })
                );
            });
    }
}

function fetchMusciServiceAccount(session) {
    const option = {
        method: "GET",
        headers: {
            Authorization: "Bearer " + session.accessToken,
        },
    };

    return fetch(spotify_api_uri + "/me", option).then((r) => {
        if (r.ok) {
            return r.json();
        }
        throw new Error(
            "Error fetching user information . " + r.status + ":" + r.statusText
        );
    });
}

function setMusicServiceAccess(body, req) {
    const access_token = body.access_token;
    const refresh_token = body.refresh_token;
    const token_type = body.token_type;

    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.tokenType = token_type;
    req.session.musicService = "spotify";
    console.log("Set accessToken on session ", access_token);
}

function setMusicServiceUser(user, req) {
    req.session.userName = user.display_name;
    req.session.userEmail = user.email;
    req.session.userId = user.id;
    req.session.musicService = "spotify";
}

const refreshToken = (req, res, next) => {
    const session = req.session;
    /*if (
        typeof session === "undefined" ||
        typeof session.refresh_token === "undefined"
    ) {
        console.log("can't refresh token");
        res.status(401).send({
            errorMessage: "Session expired. Please refresh",
        });
        return;
    }*/

    console.log("refreshing token using ", session.refresh_token);

    const authOptions = {
        url: spotify_api_token_uri,
        headers: {
            Authorization:
                "Basic " +
                Buffer.from(
                    config.spotifyClient + ":" + config.spotifySecret
                ).toString("base64"),
        },
        form: {
            grant_type: "refresh_token",
            refresh_token: session.refresh_token,
        },
        json: true,
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("token refreshed. ");
            setMusicServiceAccess(body, req);
            next();
        } else {
            //TODO handle error refreshing
            console.log("error refreshing token. ", error);
            res.status(response.errorCode).send(body);
        }
    });
};

const currentPlayCallback = (tryRefresh, req, res) => {
    const options = {
        method: "GET",
        headers: {
            Authorization:
                req.session.tokenType + " " + req.session.accessToken,
        },
        compress: true,
    };

    fetch(spotify_api_uri + "/me/player/currently-playing", options)
        .then((r) => {
            if (r.ok) {
                return r.json();
            } else if (tryRefresh && r.status === "401") {
                console.log(
                    "[SPOTIFY] access token expired, attempting refresh"
                );

                refreshToken(req, res, (rq, rs) =>
                    currentPlayCallback(false, rq, rs)
                );
            } else {
                res.status(r.status).send();
            }
        })
        .then((r) => {
            const track = r.item.name;
            const artists = r.item.artists.map((e) => {
                return e.name;
            });
            const artwork = r.item.album.images[0].url;
            const album = r.item.album.name;
            const release = r.item.album.release_date;
            const uri = r.item.uri;

            res.send({
                track: track,
                artist: artists,
                album: album,
                releaseDate: release,
                artwork: artwork,
                uri: uri,
                res: r,
            });
        })
        .catch((e) => {
            console.log("[SPOTIFY] unexpected error ", e);
            res.status(500).send();
        });
};

const createPlayList = (tryRefresh, req, res, quiz, quizDesc) => {
    const params = {
        name: "MusiQ-" + quiz.name,
        description: quizDesc,
        public: false,
    };

    const option = {
        method: "POST",
        headers: {
            Authorization:
                req.session.tokenType + " " + req.session.accessToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    };

    return fetch(
        spotify_api_uri + "/users/" + req.session.userId + "/playlists",
        option
    )
        .then((r) => {
            if (r.ok) {
                return r.json();
            } else if (tryRefresh && r.status === "401") {
                console.log("access token expired, attempting refresh");

                /*refreshToken(req, res, (rq, rs) =>
                    currentPlayCallback(false, rq, rs, this.userId, this.quizName, this.quizDesc, this.songList)
                ).bind(this);*/
                return { error: "access token expired" };
            }

            throw new Error(
                "Error creating playlist. " + r.status + ":" + r.statusText
            );
        })
        .then((r) => {
            console.log("[SPOTIFY] Created a playlist from Quiz: %s", quiz._id);
            return {
                id: r.id,
                name: r.name,
                link: r["external_urls"]["spotify"],
                res: r,
            };
        });
};

const populatePlayList = (tryRefresh, req, res, playlist, quiz) => {
    const params = {
        uris: quiz.questions.map((q) => q.answer.uri),
    };

    const option = {
        method: "POST",
        headers: {
            Authorization:
                req.session.tokenType + " " + req.session.accessToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    };

    return fetch(
        spotify_api_uri + "/playlists/" + playlist.id + "/tracks",
        option
    ).then((r) => {
        if (r.ok) {
            return r.json();
        } else if (tryRefresh && r.status === "401") {
            console.log("access token expired, attempting refresh");

            /*refreshToken(req, res, (rq, rs) =>
                    currentPlayCallback(false, rq, rs, this.userId, this.quizName, this.quizDesc, this.songList)
                ).bind(this);*/
            return { error: "access token expired" };
        }

        throw new Error(
            "Error populating playlist. " + r.status + ":" + r.statusText
        );
    });
};

router.get("/login", loginHandler);

router.get("/logincb", loginCbHandler);

router.get("/current_play", function (req, res) {
    if (!res.locals.accessToken) {
        console.log("doesn't have access to do this. ");
        res.status(401).send();
        return;
    }

    console.log("getting current playback with ", res.locals.accessToken);
    currentPlayCallback(true, req, res);
});

//TODO router.get("/refresh_token", refreshToken);

router.post("/create_playlist", async function (req, res) {
    if (!res.locals.accessToken) {
        console.log("doesn't have access to do this. ");
        res.status(401).send();
        return;
    }

    createPlayList(true, req, res, req.body, "Playlist from MusiQ")
        .then((r) => {
            return Promise.all([
                r,
                populatePlayList(true, req, res, r, req.body),
            ]);
        })
        .then((r) => {
            res.status(200).send({ name: r[0].name, link: r[0].link });
        })
        .catch((e) => {
            //TODO make custom error to store status and message
            res.status(500).send({ error: e });
        });
});

module.exports = router;
