const debug = require("debug")("auth");
const fetch = require("node-fetch");
const { URLS } = require("./constants");
const Errors = require("./errors/auth");

let LOGIN_TIMEOUT;
let currentAuth = null;
const CREDENTIALS = {
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
function login() {
    if (!CREDENTIALS.email || !CREDENTIALS.password) {
        return Promise.reject(new Errors.MissingCredentialsError());
    }
    return fetch(URLS.LOGIN_URL, {
        method: "POST",
        headers: {
            appId: "314d4fef-e568-454a-ae06-43e3bece12a6",
            Authorization: "Basic " + new Buffer(CREDENTIALS.email + ":" + CREDENTIALS.password, "utf8").toString("base64"),
            "Ubi-AppId": "314d4fef-e568-454a-ae06-43e3bece12a6",
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({ rememberMe: true })
    })
        .then(res => {
            if (res.status !== 200) {
                return res.json().then(res => {
                    switch (res.errorCode) {
                        case 2: return Promise.reject(new Errors.MissingCredentialsError());
                        case 3: return Promise.reject(new Errors.InvalidCredentialsError());
                        case 1101: return Promise.reject(new Errors.TooManyRequestsError());
                        default: return Promise.reject(new Errors.UnknownAuthError());
                    }
                });
            }
            return res.json();
        })
        .then(res => {
            if (res && res.ticket && res.expiration) {
                currentAuth = res;
                // get expiration timeout. (renew 10 minutes before expiry)
                const expiration = (new Date(res.expiration) - new Date()) - (10 * 60 * 1000);
                // schedule token refresh
                setTimeout(login, LOGIN_TIMEOUT);

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
        return Promise.resolve(auth.ticket);
    } else {
        return login();
    }
}

function getAuthHeader() {
    return getAuthToken()
        .then(token => ({
            "Ubi-AppId": "314d4fef-e568-454a-ae06-43e3bece12a6",
            Authorization: "Ubi_v1 t=" + token
        }));
}

function setCredentials(email, password) {
    CREDENTIALS.email = email;
    CREDENTIALS.password = password;
};

function getCredentials() {
    return CREDENTIALS;
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
    getAuthHeader,
    _setAuth,
    _getAuth
};