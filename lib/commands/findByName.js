const { getAuthToken } = require("../auth");
const { URLS } = require("../constants");
const fetch = require("../fetch");

module.exports = function (aliases) {
    const query = [].concat(aliases).join(",");
    return getAuthToken()
        .then(fetch(`${URLS.URL}${query}`))    
        .then(res => [].concat(res.profiles)
            .map(prof => ({
                id: prof.profileId, name: prof.nameOnPlatform
            })))
        
}