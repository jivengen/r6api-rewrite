const { getAuthString } = require("../auth");
const debug = require("debug")("r6api:api");
const { TooManyIdsError } = require("../errors");
const { URLS } = require("../constants");
const fetch = require("../fetch");

module.exports = function (aliases) {
    const query = [].concat(aliases);
    if (query.length > 40)  {
        return Promise.reject(new TooManyIdsError("too many aliases passed (max 40)"));
    }
    debug("findByName for %o", query);
    return getAuthString()
        .then(fetch(`${URLS.URL}${query.join(",")}`))    
        .then(res => [].concat(res.profiles)
            .map(prof => ({
                id: prof.profileId, name: prof.nameOnPlatform
            })))
        
}