const { getAuthHeader } = require("../auth");
const { URLS } = require("../constants");
const fetch = require("node-fetch");

module.exports = function (aliases) {
    const query = [].concat(aliases).join(",");
    return getAuthHeader()
        .then(headers => fetch(`${URLS.URL}${query}`, { headers }))
        .then(res => {
            res.status < 299 && res.status > 200
                ? res.json()
                : res.json().then(res => Promise.reject(new Error(res.message)));
        })
        .then(res => [].concat(res.profiles)
            .map(prof => ({
                id: prof.profileId, name: prof.nameOnPlatform
            })))
        
}