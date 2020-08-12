import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import serialize from "serialize-javascript";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "server/config";

import session from "express-session";
import connect from "connect-mongodb-session";
import spotifyRouter from "server/routes/spotify.js";
import dbRouter from "server/routes/db.js";
import reactRoutesRouter from "server/routes/reactRoutesRouter.js";

const app = express();
//app.enable('trust proxy');
const sessionStore = new connect(session)({
    uri: config.dbConnStr,
    databaseName: "musiquiz",
    expires: config.sessLifetime,
    collection: "sessions",
});

app.use(cors());

app.use(morgan("common"));

app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false })); //TODO Check can use express version?
app.use(bodyParser.json());
app.use(cookieParser());

app.locals.serialize = serialize;

sessionStore.on("error", function (error) {
    console.log(error);
});

app.use(
    session({
        name: config.sessName,
        resave: true,
        saveUninitialized: true,
        secret: config.sessSecret,
        cookie: {
            maxAge: config.sessLifetime,
            sameSite: true,
            secure: false,
        },
        store: sessionStore,
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
        console.log(
            "Request %s DOESN'T have access set. %s",
            req.url,
            req.session
        );
        next();
        return;
    }

    console.log("Request %s have session set. %s", req.url, req.session);
    res.locals.accessToken = req.session.accessToken;
    res.locals.refreshToken = req.session.refreshToken;
    res.locals.musicService = req.session.musicService;
    res.locals.userId = req.session.userId;
    res.locals.userName = req.session.userName;
    res.locals.userEmail = req.session.userEmail;
    next();
});

app.use("/spotify/", spotifyRouter);
app.use("/db/", dbRouter);
app.use("/", reactRoutesRouter);

app.listen(config.port, config.host, () => {
    console.info(`Running on ${config.host}:${config.port}...`);
});
