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
const generateRandomString = (length) => {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

function setMusicServiceAccess(session, access) {
    const e = new Date(Date.now());
    e.setHours(access.expires_in / 3600 + e.getHours());

    sessionManager.set(session, {
        accessToken: access.token_type + " " + access.access_token,
        refreshToken: access.refresh_token,
        tokenExpiration: e,
    });
}

function setMusicServiceUser(session, user) {
    sessionManager.set(session, {
        userName: user.display_name,
        userEmail: user.email,
        userId: user.id,
        userScope: user.scope,
        musicService: "spotify",
    });
}

function createErrorFromRes(r) {
    const e = new Error(r.status + ":" + r.statusText);
    e.status = r.status;
    return e;
}

function getOptionWithAuth(session) {
    return {
        method: "GET",
        headers: {
            Authorization: sessionManager.get(session, "accessToken"),
        },
    };
}

function postOptionWithAuth(session, params) {
    return {
        method: "POST",
        headers: {
            Authorization: sessionManager.get(session, "accessToken"),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    };
}

function loginHandler(req, res) {
    const state = generateRandomString(16);
    console.debug("[SPOTIFY] login:state:%s > %s", state_key, state);
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

    console.debug("[SPOTIFY] logincb:state:%s > %s", state_key, state);
    console.debug(
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
                setMusicServiceAccess(req.session, r);

                res.session =
                    typeof res.session === "undefined"
                        ? req.session
                        : res.session;

                const user = await fetchMusciServiceAccount(res.session);
                console.log("[SPOTIFY] received user info: ", user);
                setMusicServiceUser(req.session, user);

                const url = sessionManager.get(req.session, "requestingURL");
                res.redirect(typeof url !== "undefined" ? url : "/");
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

const checkAccessToken = async (req, res) => {
    if (!res.locals.accessToken) {
        console.error("doesn't have access to do this. ");
        res.status(401).send();
        return;
    }

    const now = new Date(Date.now());
    if (sessionManager.get(req.session, "tokenExpiration") < now) {
        return refreshAccess(req, res);
    }
};

async function refreshAccess(req) {
    const session = req.session;
    console.debug(
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

            throw createErrorFromRes(r);
        })
        .then((r) => {
            return setMusicServiceAccess(req.session, r);
        });
}

async function fetchMusciServiceAccount(session) {
    return fetch(spotify_api_uri + "/me", getOptionWithAuth(session)).then(
        (r) => {
            if (r.ok) {
                return r.json();
            }
            throw createErrorFromRes(r, "Error fetching user information. ");
        }
    );
}

async function currentPlayHandler(session, res) {
    return fetch(
        spotify_api_uri + "/me/player/currently-playing",
        getOptionWithAuth(session)
    )
        .then((r) => {
            if (r.ok && r.status === 200) {
                return r.json();
            }

            throw createErrorFromRes(r);
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
            console.error("[SPOTIFY] error ", e);
            res.status(e.status).send({ error: e.statusText });
        });
}

async function createPlayList(session, quiz, quizDesc) {
    const params = {
        name: "MusiQ-" + quiz.name,
        description: quizDesc,
        public: false,
    };

    return fetch(
        `${spotify_api_uri}/users/${sessionManager.get(
            session,
            "userId"
        )}/playlists`,
        postOptionWithAuth(session, params)
    )
        .then((r) => {
            if (r.ok) {
                return r.json();
            }

            throw createErrorFromRes(r, "Error creating playlist. ");
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
}

async function populatePlayList(session, playlist, quiz) {
    const params = {
        uris: quiz.questions.map((q) => q.answer.uri),
    };

    console.log("populating playlist with ", quiz);
    return fetch(
        spotify_api_uri + "/playlists/" + playlist.id + "/tracks",
        postOptionWithAuth(session, params)
    ).then((r) => {
        if (r.ok) {
            return r.json();
        }

        throw createErrorFromRes(r, "Error populating playlist,");
    });
}

router.get("/login", loginHandler);

router.get("/logincb", loginCbHandler);

router.get("/current_play", function (req, res) {
    checkAccessToken(req, res)
        .then(() => currentPlayHandler(req.session, res))
        .catch((e) => {
            console.error("caught error while getting current play", e);
            res.status(e.status ? e.status : 500).send();
        });
});

router.post("/create_playlist", async function (req, res) {
    checkAccessToken(req, res)
        .then(() =>
            createPlayList(req.session, req.body, "Playlist from MusiQ")
        )
        .then((r) =>
            Promise.all([r, populatePlayList(req.session, r, req.body)])
        )
        .then((r) => res.send({ name: r[0].name, link: r[0].link }))
        .catch((e) => {
            //TODO make custom error to store status and message
            res.status(500).send({ error: e });
        });
});

module.exports = router;
