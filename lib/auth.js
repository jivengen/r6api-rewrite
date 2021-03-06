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
                debug("new auth: expires %s", res.expiration);
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
            debug("login failed: %o", err);
            clearTimeout(LOGIN_TIMEOUT);
            return Promise.reject(err);
        });
}

/** returns a valid token  */
function getAuthToken() {
    if (currentAuth
        && currentAuth.expiration
        && currentAuth.ticket
        && new Date(currentAuth.expiration) > new Date()) {
        return Promise.resolve(currentAuth.ticket);
    } else {
        return login()
            .then(() => currentAuth.ticket);
    }
}

/**
 * returns a Promise of a value for the Authorization header
 */
function getAuthString() {
    return getAuthToken()
        .then(token => "Ubi_v1 t=" + token);
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
    getAuthString,
    getAuthToken,
    _setAuth,
    _getAuth
};