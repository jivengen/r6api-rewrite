const { getAuthString } = require("../auth");
const debug = require("debug")("r6api:api");
const { TooManyIdsError } = require("../errors");
const { URLS } = require("../constants");
const fetch = require("../fetch");

module.exports = function (ids) {
    const query = [].concat(ids);
    if (query.length > 200)  {
        return Promise.reject(new TooManyIdsError("too many ids passed (max 200)"));
    }
    debug("getPlaytime for %o", query);
    return getAuthString()
        .then(fetch(`${URLS.TIME_URL}${query.join(",")}`))    
        .then(res => Object.keys(res.results)
            .map(key => ({
                id: key,
                casual: res.results[key]["casualpvp_timeplayed:infinite"],
                ranked: res.results[key]["rankedpvp_timeplayed:infinite"]
            })))
        
}