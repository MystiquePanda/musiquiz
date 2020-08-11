const env = process ? process.env : "development";
console.log(env);

const port = env.PORT || 8080;
const host = env.HOSTNAME || "0.0.0.0";
const isDev = typeof env.NODE_ENV === "undefined" || env.NODE_ENV.trim() !== "production";
const base = env.MQ_BASE_URI.trim() || "https://musiquiz.mystiquepanda.com";

module.exports = {
    port: port,
    host: host,
    isDev: isDev,
    isBrowser: typeof window !== "undefined",
    baseURI: isDev ? "http://" + host + ":" + port : base,
    spotifySecret: env.MQ_SPOTIFY_SECRET.trim(),
    dbConnStr:
        "mongodb+srv://musiquiz_admin:" +
        env.MQ_MONGODB_PASS.trim() +
        "@cluster0-og4sd.mongodb.net/musiquiz?retryWrites=true&w=majority",
    SESS_NAME: "session",
    SESS_LIFETIME: 30 * 60 * 1000,
    SESS_SECRET: env.MQ_SESS_SECRET.trim(),
};
