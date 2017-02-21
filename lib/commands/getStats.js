const { getAuthString } = require("../auth");
const debug = require("debug")("r6api:api");
const querystring = require("querystring");
const { TooManyIdsError } = require("../errors");
const { URLS } = require("../constants");
const fetch = require("../fetch");
    
module.exports = function (ids, opts) {
    const query = [].concat(ids);
    if (query.length > 200)  {
        return Promise.reject(new TooManyIdsError("too many ids passed (max 200)"));
    }
    debug("getStats for %O", query);
    let options = {
        //@TODO make statmap  (https://gitlab.com/gitgudscrub/r6api/blob/master/lib/statsmap.js)
        statistics: "commaseperated,stuff"
    }
    Object.assign(options, opts, {
        populations: query.join(",")
    });
    const regionPromises = getAuthString()
        .then(fetch(`${URLS.RANK_URL}${querystring.stringify(options)}`))
        .then(res => {
            //@TODO map res
            return res;
        })
}