const debug = require("debug")("r6api:fetch");
const nodeFetch = require("node-fetch");
const Errors = require("./errors");
const auth = require("./auth");
const merge = require("lodash.merge");

/**
 * do a fetch
 */
module.exports = (url, params) => token => Promise.resolve(merge({}, {
    method: "GET",
    headers: {
        "Ubi-AppId": "39baebad-39e5-4552-8c25-2c9b919064e2",
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": token
    }
}, (params || {})))
    .then(opts => {
        opts.body
            ? debug("%s %s %O", opts.method, url, opts.body)
            : debug("%s %s", opts.method, url)
        return opts;
    })    
    .then(opts => nodeFetch(url, opts))
    .then(res => {
        if (res.status !== 200) {
            return res.json().then(res => {
                debug("failed response: %O", res)
                // try matching http stati first
                switch (res.httpCode) {
                    case 429: return Promise.reject(new Errors.TooManyRequestsError(res.message));
                    case 400: return Promise.reject(new Errors.BadRequestError(res.message || res.errorCode));    
                    default: break;
                }
                // after that the known error codes
                switch (res.errorCode) {
                    case 1: return Promise.reject(new Errors.MissingHeaderError(res.message))
                    case 2: return Promise.reject(new Errors.MissingCredentialsError(res.message));
                    case 3: return Promise.reject(new Errors.MissingHeaderError(res.message))    
                    case 3: return Promise.reject(new Errors.InvalidCredentialsError(res.message));
                    case 1101: return Promise.reject(new Errors.TooManyRequestsError(res.message));
                    case 1100: return Promise.reject(new Errors.TooManyRequestsError(res.message));
                    default:
                        console.log(res);
                        return Promise.reject(new Errors.UnknownAuthError(res.message || res.errorCode));
                }
            });
        }
        return res.json();
    });
