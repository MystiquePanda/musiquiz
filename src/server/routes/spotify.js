import config from "server/config";
import express from "express";
import querystring from "querystring";
import fetch from "node-fetch";
import sessionManager from "server/session";

const router = express.Router();

const auth_callback_uri = config.baseURI + "/spotify/logincb";
const spotify_base_uri = "https://accounts.spotify.com";
const spotify_auth_uri = spotify_base_uri + "/authorize?";
const spotify_api_token_uri = spotify_base_uri + "/api/token";
const spotify_api_uri = "https://api.spotify.com/v1";

const state_key = "spotify_auth_state";
const token_auth =
    "Basic " +
    Buffer.from(config.spotifyClient + ":" + config.spotifySecret).toString(
        "base64"
    );
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
                Authorization: token_auth,
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
            Authorization: sessionManager.get(session, "accessToken"),
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
    const e = new Date(Date.now());
    e.setHours(body.expires_in / 3600 + e.getHours());

    sessionManager.set(req.session, {
        accessToken: body.token_type + " " + body.access_token,
        refreshToken: body.refresh_token,
        tokenExpiration: e,
    });
}

function setMusicServiceUser(user, req) {
    sessionManager.set(req.session, {
        userName: user.display_name,
        userEmail: user.email,
        userId: user.id,
        userScope: user.scope,
        musicService: "spotify",
    });
}

const refreshToken = (req, res) => {
    const session = req.session;
    console.log(
        "[SPOTIFY] refreshing token using ",
        sessionManager.get(session, "refreshToken")
    );

    const params = new URLSearchParams();
    params.append("refresh_token", sessionManager.get(session, "refreshToken"));
    params.append("grant_type", "refresh_token");

    const authOptions = {
        method: "POST",
        headers: {
            Authorization: token_auth,
        },
        body: params,
    };

    return fetch(spotify_api_token_uri, authOptions)
        .then((r) => {
            if (r.ok) {
                return r.json();
            }
            throw new Error(
                "Error refreshing access token. " +
                    r.status +
                    ":" +
                    r.statusText
            );
        })
        .then(async (r) => {
            setMusicServiceAccess(r, req);
        });
};

const currentPlayCallback = (session, res) => {
    const options = {
        method: "GET",
        headers: {
            Authorization: sessionManager.get(session, "accessToken"),
        },
        compress: true,
    };

    fetch(spotify_api_uri + "/me/player/currently-playing", options)
        .then((r) => {
            if (r.ok) {
                return r.json();
            }
            const e = new Error(r.status + ":" + r.statusText);
            e.status = r.status;
            throw e;
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
            console.log("[SPOTIFY] error ", e);
            res.status(e.status).send();
        });
};

const createPlayList = (req, res, quiz, quizDesc) => {
    const params = {
        name: "MusiQ-" + quiz.name,
        description: quizDesc,
        public: false,
    };

    const option = {
        method: "POST",
        headers: {
            Authorization: sessionManager.get(req.session, "accessToken"),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    };

    return fetch(
        spotify_api_uri +
            "/users/" +
            sessionManager.get(req.session, "userId") +
            "/playlists",
        option
    )
        .then((r) => {
            if (r.ok) {
                return r.json();
            }

            throw new Error(
                "Error creating playlist. " + r.status + ":" + r.statusText
            );
        })
        .then((r) => {
            console.log("[SPOTIFY] Created playlist from Quiz: %s", quiz._id);
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
            Authorization: sessionManager.get(req.session, "accessToken"),
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

const checkAccessToken = async (req, res) => {
    if (sessionManager.get(req.session, "tokenExpiration") < new Date()) {
        return refreshToken(req, res);
    }

    return {};
};

router.get("/login", loginHandler);

router.get("/logincb", loginCbHandler);

router.get("/current_play", function (req, res) {
    if (!res.locals.accessToken) {
        console.log("doesn't have access to do this. ");
        res.status(401).send();
        return;
    }

    checkAccessToken(req, res)
        .then(() => currentPlayCallback(req.session, res))
        .catch((e) => {
            console.log("caught error while getting current play");
            res.status(500).send();
        });
});

//TODO router.get("/refresh_token", refreshToken);

router.post("/create_playlist", async function (req, res) {
    if (!res.locals.accessToken) {
        console.log("doesn't have access to do this. ");
        res.status(401).send();
        return;
    }

    checkAccessToken(req, res)
        .then(() => createPlayList(req, res, req.body, "Playlist from MusiQ"))
        .then((r) =>
            Promise.all([r, populatePlayList(true, req, res, r, req.body)])
        )
        .then((r) => res.status(200).send({ name: r[0].name, link: r[0].link }))
        .catch((e) => {
            //TODO make custom error to store status and message
            res.status(500).send({ error: e });
        });
});

module.exports = router;
