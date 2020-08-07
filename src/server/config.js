const env = process ? process.env : "development";
const port = env.PORT || 4242;
const host = env.HOSTNAME || "localhost";

module.exports = {
    port: port,
    host: host,
    isDev: env.NODE_ENV !== "production",
    isBrowser: typeof window !== "undefined",
    baseURI: "http://" + host + ":" + port,
    spotifySecret: env.SPOTIFY_SECRET,
    dbConnStr:
        "mongodb+srv://musiquiz_admin:" +
        env.MONGODB_PASS +
        "@cluster0-og4sd.mongodb.net/musiquiz?retryWrites=true&w=majority",
    SESS_NAME: "session",
    SESS_LIFETIME: 5 * 60 * 1000,
    SESS_SECRET: "38ced02ac05547418ff0fc056e70ddae",
};
