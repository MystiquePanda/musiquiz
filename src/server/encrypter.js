import config from "server/config";

const crypto = require("crypto");

const AESCrypt = {};

const algorithm = "aes-256-cbc";
const iv = Buffer.alloc(16);
const key = crypto
    .createHash("md5")
    .update(config.sessSecret, "utf-8")
    .digest("hex")
    .toUpperCase();

AESCrypt.makeIv = crypto.randomBytes(16);

AESCrypt.encrypt = (d) => {
    const encipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = encipher.update(d, "utf8", "binary");

    encrypted += encipher.final("binary");

    return Buffer.from(encrypted, "binary").toString("base64");
};

AESCrypt.decrypt = (encrypted) => {
    encrypted = Buffer.from(encrypted, "base64").toString("binary");

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "binary", "utf8");

    decrypted += decipher.final("utf8");

    return decrypted;
};



module.exports = AESCrypt;
