const env = process ? process.env : "development";
const isDev =
    typeof env.NODE_ENV === "undefined" || env.NODE_ENV.trim() !== "production";

if (isDev) {
    console.debug(env);
}

const port = env.PORT || 8080;
const host = isDev ? "192.168.8.92" : "0.0.0.0";

const base = env.MQ_BASE_URI.trim() || "https://musiquiz.mystiquepanda.com";
const mongoUser = env.MQ_MONGODB_USER.trim();
const mongoPass = env.MQ_MONGODB_PASS.trim();
const mongoCluster = env.MQ_MONGODB_CLUSTER.trim();

module.exports = {
    port: port,
    host: host,
    isDev: isDev,
    isBrowser: typeof window !== "undefined",
    baseURI: isDev ? `http://${host}:${port}` : base,
    spotifySecret: env.MQ_SPOTIFY_SECRET.trim(),
    spotifyClient: env.MQ_SPOTIFY_CLIENT.trim(),
    dbConnBase: `mongodb+srv://${mongoUser}:${mongoPass}@${mongoCluster}`,
    dbConnStr: `mongodb+srv://${mongoUser}:${mongoPass}@${mongoCluster}/musiquiz`,
    sessName: "dhf",
    sessLifetime: 5 * 24 * 60 * 60 * 1000,
    sessSecret: env.MQ_SESS_SECRET.trim(),
    sessStorage: isDev ? "memory" : "stack",
    emailHost: "smtp.gmail.com",
    emailPort: 465,
    emailAcct: env.MQ_EMAIL,
    emailPass: env.MQ_EMAIL_PASS,
};
