const debug = require("debug")("r6api:fetch");
const nodeFetch = require("node-fetch");
const Errors = require("./errors");
const auth = require("./auth");
const merge = require("lodash.merge");

/**
 * do a fetch
 */
module.exports = (url, params) => token => Promise.resolve(merge({},{
        headers: {
            "Ubi-AppId": "39baebad-39e5-4552-8c25-2c9b919064e2",
            "Content-Type": "application/json; charset=UTF-8",
            "Authorization": token
        }
    }, (params ||  {})))  
    .then(opts => {
        debug(`${opts.method ||  "GET"} to ${url} with ${JSON.stringify(opts.body ||  {})}`)
        return opts;
    })    
    .then(opts => nodeFetch(url, opts))
    .then(res => {
        if (res.status !== 200) {
            return res.json().then(res => {

                // try matching http stati first
                switch (res.httpCode) {
                    case 429: return Promise.reject(new Errors.TooManyRequestsError(res.message));
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
                    default: return Promise.reject(new Errors.UnknownAuthError(res.message));
                }
            });
        }
        return res.json();
    });
