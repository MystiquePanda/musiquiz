import encrypter from "server/encrypter";

const sessionFields = {
    accessToken: { encrypt: true },
    refreshToken: { encrypt: true },
    tokenExpiration: { encrypt: false },
    musicService: { encrypt: true },
    userName: { encrypt: true },
    userEmail: { encrypt: true },
    userId: { encrypt: true },
    userScope: { encrypt: true },
    requestingURL:{encrypt: false}
};

const setSessionFields = (session, o) => {
    const updated = [];

    Object.keys(sessionFields).forEach((f) => {
        if (typeof o[f] !== "undefined") {
            session[f] = sessionFields[f].encrypt
                ? encrypter.encrypt(o[f])
                : o[f];
            updated.push(f);
        }
    });
    console.debug("[SESSION] fields set: ", updated.toString());
};

const getSessionField = (session, f) => {
    if (typeof sessionFields[f] === "undefined") {
        throw Error("Invalid session field:", f);
    }

    return typeof session[f] === "undefined"
        ? undefined
        : sessionFields[f].encrypt
        ? encrypter.decrypt(session[f])
        : session[f];
};

const checkSessionField = (session, f) => {
    if (typeof sessionFields[f] === "undefined") {
        throw Error("Invalid session field:", f);
    }

    return typeof session[f] !== "undefined";
};
module.exports = {
    set: setSessionFields,
    get: getSessionField,
    isSet: checkSessionField,
};
