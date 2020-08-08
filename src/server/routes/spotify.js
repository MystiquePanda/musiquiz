import config from "server/config";
import express from "express";
import request from "request";
import querystring from "querystring";

const router = express.Router();

const client_id = "39141fb989524588ab46ac4ccaff6ee7";
const client_secret = config.spotifySecret;

const auth_callback_uri = config.baseURI + "/spotify/logincb";
const spotify_base_uri = "https://accounts.spotify.com";
const spotify_auth_uri = spotify_base_uri + "/authorize?";
const spotify_api_token_uri = spotify_base_uri + "/api/token";
const spotify_api_uri = "https://api.spotify.com/v1/me";
const stateKey = "spotify_auth_state";

const generateRandomString = function (length) {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

router.get("/login", function (req, res) {
    const state = generateRandomString(16);
    console.log("login:state:%s > %s", stateKey, state);

    res.cookie(stateKey, state);

    const scope =
        "user-read-currently-playing user-read-playback-state streaming user-read-email user-read-private";

    res.redirect(
        spotify_auth_uri +
            querystring.stringify({
                response_type: "code",
                client_id: client_id,
                scope: scope,
                redirect_uri: auth_callback_uri,
                state: state,
            })
    );
});

router.get("/logincb", function (req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    console.log("callback:state:%s > %s", stateKey, state);
    console.log("callback:storedState:%s > %s", stateKey, storedState);

    if (state === null || state !== storedState) {
        res.redirect(
            "/door?" +
                querystring.stringify({
                    error: "state_mismatch",
                })
        );
        //TODO handle this error on UI side
    } else {
        res.clearCookie(stateKey);
        const authOptions = {
            url: spotify_api_token_uri,
            form: {
                code: code,
                redirect_uri: auth_callback_uri,
                grant_type: "authorization_code",
            },
            headers: {
                Authorization:
                    "Basic " +
                    Buffer.from(client_id + ":" + client_secret).toString(
                        "base64"
                    ),
            },
            json: true,
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                setMusicServiceAccess(body, req);

                res.redirect("/");
            } else {
                console.log("ERROR logging in", error, response.statusCode);
                res.redirect(
                        "/door?" +
                        querystring.stringify({
                            error: "invalid_token",
                        })
                );
            }
        });
    }
});

function setMusicServiceAccess(body, req) {
    const access_token = body.access_token;
    const refresh_token = body.refresh_token;
    const token_type = body.token_type;

    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.token_type = token_type;
    req.session.musicService = "spotify";
    console.log("Setting accessToken on session ",access_token);
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
                Buffer.from(client_id + ":" + client_secret).toString("base64"),
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
        url: spotify_api_uri + "/player/currently-playing",
        headers: {
            Authorization: "Bearer " + req.session.accessToken,
        },
        json: true,
    };

    request.get(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const track = body.item.name;
            const artists = body.item.artists.map((e) => {
                return e.name;
            });
            const artwork = body.item.album.images[0].url;
            const album = body.item.album.name;
            const release = body.item.album.release_date;

            res.send({
                track: track,
                artist: artists,
                album: album,
                releaseDate: release,
                artwork: artwork,
                res: body,
            });
        } else if (tryRefresh && response.statusCode === "401") {
            console.log("access token expired, attempting refresh");

            refreshToken(req, res, (rq, rs) =>
                currentPlayCallback(false, rq, rs)
            );
        } else {
            //failed to refresh so error for real
            const sc = response.statusCode;
            let err;
            console.log("received resonse with code ", sc);

            /*switch (sc) {
                case 204:
                    err = {
                        "errorMsg":
                            "Please Make sure the track is playing on Spotify.",
                    };
                    break;
                default:
                    err = {
                        error:
                            typeof body === "undefined"
                                ? response.statusMessage
                                : body.error,
                    };
            }*/

            console.log("ERROR", err);
            res.status(sc).send();
        }
    });
};

router.get("/current_play", function (req, res) {
    if (!res.locals.accessToken) {
        console.log("doesn't have access to do this. ");
        res.status(401).send();
        return;
    }

    console.log("getting current playback with ", res.locals.accessToken);
    currentPlayCallback(true, req, res);
});

router.get("/refresh_token", refreshToken);

module.exports = router;
