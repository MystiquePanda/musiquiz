import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import serialize from "serialize-javascript";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "server/config";

import session from "express-session";
//import uuid from "node-uuid";

import spotifyRouter from "server/routes/spotify.js";
import dbRouter from "server/routes/db.js";
import reactRoutesRouter from "server/routes/reactRoutesRouter.js";

const app = express();
//app.enable('trust proxy');

app.use(cors());

app.use(morgan("common"));

app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false })); //TODO Check can use express version?
app.use(bodyParser.json());
app.use(cookieParser());

app.locals.serialize = serialize;

app.use(
    session({
        name: config.SESS_NAME,
        resave: false,
        saveUninitialized: false,
        secret: config.SESS_SECRET,
        cookie: {
            maxAge: config.SESS_LIFETIME,
            sameSite: true,
            secure: !config.isDev,
        },
    })
);

if (config.isDev) {
    app.locals.gVars = {
        main: ["main.css", "main.js"],
        vendor: "vendor.js",
    };
} else {
    try {
        app.locals.gVars = require("../../.reactful.json");
    } catch (err) {
        console.error("Reactful did not find Webpack generated assets");
    }
}

app.use((req, res, next) => {
    if (!(req.session && req.session.accessToken && req.session.refreshToken)) {
        // TODO redirect to main page?
        console.log("Request %s DOESN'T have access set. %s", req.url, req.session);
        next();
        return;
    }

    console.log("Request %s have session set. %s", req.url, req.session);
    res.locals.accessToken = req.session.accessToken;
    res.locals.refreshToken = req.session.refreshToken;
    res.locals.musicService = req.session.musicService;
    next();
});

app.use("/spotify/", spotifyRouter);
app.use("/db/", dbRouter);
app.use("/", reactRoutesRouter);

app.listen(config.port, config.host, () => {
    console.info(`Running on ${config.host}:${config.port}...`);
});
