const debug = require("debug")("auth");
const fetch = require("node-fetch");
const { URLS } = require("./constants");
const Errors = require("./errors/auth");
const MAX_AUTH_RETRIES = 3;
let currentRetry = 0;
let currentHeader = null;

const auth = {
    ticket: null,
    validUntil: new Date()
}

/**
 * calls ubi login endpoint.
 * this function is not rate limited and should only be called internally
 *
 * @param {string} email account email
 * @param {string} pass account password
 * @returns {Promise} resolves with token
 */
function login(email, pass) {
    if (!email || !pass) {
        return Promise.reject(new Errors.MissingCredentialsError());
    }
    return fetch(URLS.LOGIN_URL, {
        method: "POST",
        headers: {
            appId: "314d4fef-e568-454a-ae06-43e3bece12a6",
            Authorization: "Basic " + new Buffer(email + ":" + pass, "utf8").toString("base64"),
            "Ubi-AppId": "314d4fef-e568-454a-ae06-43e3bece12a6",
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({ rememberMe: true })
    })
    .then(res => {
        if (res.status !== 200) {
            return res.json().then(res => {
                debug(res);
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
        if (res && res != "") {
            auth = res;
            return Promise.resolve(res);
        } else {
            return Promise.reject(new Errors.UnknownAuthError());
        }
    });
}

/**
 * returns a Promise of a valid auth token
 */
function getAuthToken() {
    if (auth.validUntil > new Date() && auth.ticket) {
        return Promise.resolve(auth.ticket);
    } else {
        
    }
}

module.exports = {
    login,
    getAuthToken
}