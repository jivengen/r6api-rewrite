const debug = require("debug")("r6api:auth");
const fetch = require("./fetch");
const { URLS } = require("./constants");
const Errors = require("./errors");

let LOGIN_TIMEOUT;
let currentAuth = null;
const cred = {
    email: "",
    password: ""
};

/**
 * calls ubi login endpoint.
 * this function is not rate limited and should only be called internally
 *
 * @param {string} email account email
 * @param {string} pass account password
 * @returns {Promise} resolves with token
 */
function login(email, pass) {
    if (email && pass) {
        setCredentials(email, pass);
    }

    if (!cred.email || !cred.password) {
        return Promise.reject(new Errors.MissingCredentialsError());
    }
    const token = "Basic " + new Buffer(cred.email + ":" + cred.password, "utf8").toString("base64");

    return Promise.resolve(token)
        .then(fetch(URLS.LOGIN_URL, {
            method: "POST",
            body: JSON.stringify({ rememberMe: true })
        }))
        .then(res => {
            if (res && res.ticket && res.expiration) {
                currentAuth = res;
                // get expiration timeout. (renew 10 minutes before expiry)
                const expiration = (new Date(res.expiration) - new Date()) - (10 * 60 * 1000);
                // schedule token refresh
                LOGIN_TIMEOUT = setTimeout(login, expiration);

                return Promise.resolve(res);
            } else {
                return Promise.reject(new Errors.UnknownAuthError());
            }
        })
        .catch(err => {
            clearTimeout(LOGIN_TIMEOUT);
            return Promise.reject(err);
        });
}

/**
 * returns a Promise of a valid auth token
 */
function getAuthToken() {
    if (currentAuth
        && currentAuth.expiration
        && currentAuth.ticket
        && new Date(currentAuth.expiration) > new Date()) {
        return Promise.resolve("Ubi_v1 t=" + currentAuth.ticket);
    } else {
        return login()
            .then(() => "Ubi_v1 t=" + currentAuth.ticket);
    }
}

function setCredentials(email, password) {
    cred.email = email;
    cred.password = password;
};

function getCredentials() {
    return cred;
}

function cancelRefresh() {
    clearTimeout(LOGIN_TIMEOUT);
}
function refreshScheduled() {
    return !!LOGIN_TIMEOUT;
}

function _setAuth(authObj) {
    currentAuth = authObj;
}
function _getAuth() {
    return currentAuth;
}
module.exports = {
    login,
    setCredentials,
    getCredentials,
    cancelRefresh,
    refreshScheduled,
    getAuthToken,
    _setAuth,
    _getAuth
};