const env = process ? process.env : "development";
const port = env.PORT || 8080;
const host = env.HOSTNAME || "0.0.0.0";
const isDev = env.NODE_ENV.trim() !== "production";
const base = env.MQ_BASE_URI.trim() || "https://musiquiz.mystiquepanda.com";

module.exports = {
    port: port,
    host: host,
    isDev: isDev,
    isBrowser: typeof window !== "undefined",
    baseURI: isDev ? "http://" + host + ":" + port : base,
    spotifySecret: env.MQ_SPOTIFY_SECRET,
    dbConnStr:
        "mongodb+srv://musiquiz_admin:" +
        env.MQ_MONGODB_PASS +
        "@cluster0-og4sd.mongodb.net/musiquiz?retryWrites=true&w=majority",
    SESS_NAME: "session",
    SESS_LIFETIME: 5 * 60 * 1000,
    SESS_SECRET: env.MQ_SESS_SECRET,
};
