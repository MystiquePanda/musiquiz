import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import serialize from "serialize-javascript";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import config from "server/config";
import path from "path";
import session from "express-session";
import connect from "connect-mongodb-session";
import spotifyRouter from "server/routes/spotify.js";
import dbRouter from "server/routes/db.js";
import reactRoutesRouter from "server/routes/reactRoutesRouter.js";
import mailRouter from "server/routes/mail.js";
import sessionManager from "server/session";

const app = express();

const sessionStore = new connect(session)({
    uri: config.dbConnStr,
    databaseName: "musiquiz",
    expires: config.sessLifetime,
    collection: config.sessStorage,
});

app.use(cors());
//app.use(helmet());
app.use(morgan("common"));

app.use(express.static("public"));

app.set("views", path.join(__dirname, "../../public/views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false })); //TODO Check can use express version?
app.use(bodyParser.json());
app.use(cookieParser());

app.locals.serialize = serialize;

sessionStore.on("error", function (error) {
    console.error("[SESSION STORE]", error);
});

app.use(
    session({
        name: config.sessName,
        resave: false,
        saveUninitialized: false,
        secret: config.sessSecret,
        cookie: {
            maxAge: config.sessLifetime,
            sameSite: false,
            secure: !config.isDev,
        },
        store: sessionStore,
    })
);

if (!config.isDev) {
    app.set("trust proxy", 1); // trust first proxy
}

app.use((req, res, next) => {
    console.debug(
        ">>>>>> INCOMING with session ID: ",
        req.sessionID,
        req.session
    );
    if (!(req.session && sessionManager.isSet(req.session, "accessToken"))) {
        console.debug("Request %s DOESN'T have access set. ", req.url);
    } else {
        console.debug("Request %s have access set. ", req.url);
        sessionManager.set(res.locals, req.session);
    }
    next();
});

app.use("/spotify/", spotifyRouter);
app.use("/db/", dbRouter);
app.use("/mail/", mailRouter);
app.use("/", reactRoutesRouter);

app.listen(config.port, config.host, () => {
    console.info(`Running on ${config.host}:${config.port}...`);
});
