const { getAuthString } = require("../auth");
const debug = require("debug")("r6api:api");
const querystring = require("querystring");
const { TooManyIdsError } = require("../errors");
const { URLS } = require("../constants");
const fetch = require("../fetch");

const statmap = {
	matchesLost: 'generalpvp_matchlost:infinite',
	matchesWon: 'generalpvp_matchwon:infinite',
	kills: 'generalpvp_kills:infinite',
	deaths: 'generalpvp_death:infinite'
};
let regions = [
	'ncsa',
	'emea',
	'apac'
];
let plucks = [
	'max_mmr',
	'skill_mean',
	'abandons',
	'region',
	'rank',
	'mmr',
	'wins',
	'skill_stdev',
	'losses',
	'max_rank'
];

module.exports = function (ids, opts) {
    const query = [].concat(ids);
    if (query.length > 200)  {
        return Promise.reject(new TooManyIdsError("too many ids passed (max 200)"));
    }
    let options = {
        season_id: -1
    }
    Object.assign(options, opts, {
        profile_ids: query.join(",")
    });
    debug("getRank for %O", options);
    const regionPromises = regions.map(region => getAuthString().then(token => {
        const qs = Object.assign({}, options, { region_id: region });
        return fetch(`${URLS.RANK_URL}${querystring.stringify(qs)}`)(token);
    }));
    return Promise.all(regionPromises)
        .then(res => res.reduce(function (map, regionResponse, i) {
            Object.keys(regionResponse.players)
                .forEach(id => {
                    const value = regionResponse.players[id];
                    if (map[id] == null) {
                        map[id] = { id, season: value.season };
                    }
                    map[id][value.region] = plucks.reduce((acc, curr) => {
                        acc[curr] = value[curr];
                        return acc;
                    }, {});
                });
            return map;
        }, {}))
        .then(rankMap => Object.keys(rankMap).map(id => rankMap[id]));
}