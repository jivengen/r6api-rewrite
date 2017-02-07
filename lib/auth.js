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
function login(email, pass) {
    if (email && pass) {
        setCredentials(email, pass);
    }

    if (!CREDENTIALS.email || !CREDENTIALS.password) {
        return Promise.reject(new Errors.MissingCredentialsError());
    }
    return fetch(URLS.LOGIN_URL, {
        method: "POST",
        headers: {
            appId: "39baebad-39e5-4552-8c25-2c9b919064e2",
            Authorization: "Basic " + new Buffer(CREDENTIALS.email + ":" + CREDENTIALS.password, "utf8").toString("base64"),
            "Ubi-AppId": "39baebad-39e5-4552-8c25-2c9b919064e2",
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({ rememberMe: true })
    })
        .then(res => {
            if (res.status !== 200) {
                return res.json().then(res => {
                    console.log(res);
                    process.exit(0);

                    // try matching http stati first
                    switch (res.httpCode) {
                        case 429: return Promise.reject(new Errors.TooManyRequestsError(res.message));
                        default: break;    
                    }
                    // after that the known error codes
                    switch (res.errorCode) {
                        case 2: return Promise.reject(new Errors.MissingCredentialsError(res.message));
                        case 3: return Promise.reject(new Errors.InvalidCredentialsError(res.message));
                        case 1101: return Promise.reject(new Errors.TooManyRequestsError(res.message));
                        case 1100: return Promise.reject(new Errors.TooManyRequestsError(res.message));
                        default: return Promise.reject(new Errors.UnknownAuthError(res.message));
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
                setTimeout(login, expiration);

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