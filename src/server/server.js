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
import sessionManager from "server/session";

const app = express();

const sessionStore =new connect(session)({
    uri: config.dbConnStr,
    databaseName: "musiquiz",
    expires: config.sessLifetime,
    collection: config.isDev?"memory":"stack",
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
    console.log("[SESSION STORE]", error);
});

if (config.isDev) {
    app.locals.gVars = {
        main: ["main.css", "main.js"],
        vendor: "vendor.js",
    };
} else {
    app.set('trust proxy', 1) // trust first proxy
    session.cookie.secure = true // serve secure cookies

    try {
        app.locals.gVars = require("../../.reactful.json");
    } catch (err) {
        console.error("Reactful did not find Webpack generated assets");
    }
}

app.use(
    session({
        name: config.sessName,
        resave: false,
        saveUninitialized: false,
        secret: config.sessSecret,
        cookie: {
            maxAge: config.sessLifetime,
            sameSite: false
        },
        store: sessionStore,
    })
);



app.use((req, res, next) => {
    /*const oldRedirect = res.redirect;
    res.redirect = function (...args) {
      if (req.session) {
       console.log("redirecting after saving...", req.sessionID, req.session) 

        req.session.save(() => Reflect.apply(oldRedirect, this, args))
      } else {
        Reflect.apply(oldRedirect, this, args);
      }
    }*/

    console.debug(">>>>>> INCOMING with session ID: ", req.sessionID, req.session)
    if (!(req.session && sessionManager.isSet(req.session, "accessToken"))) {
        console.debug(
            "Request %s DOESN'T have access set. ",
            req.url,
        );
    } else {
        console.debug("Request %s have access set. ", req.url);
        sessionManager.set(res.locals, req.session);
    }
    next();
});

app.use("/spotify/", spotifyRouter);
app.use("/db/", dbRouter);
app.use("/", reactRoutesRouter);

app.listen(config.port, config.host, () => {
    console.info(`Running on ${config.host}:${config.port}...`);
});
