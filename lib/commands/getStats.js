const { getAuthString } = require("../auth");
const debug = require("debug")("r6api:api");
const querystring = require("querystring");
const { TooManyIdsError } = require("../errors");
const { URLS, WEAPONTYPES, OPERATORS } = require("../constants");
const fetch = require("../fetch");

/*
 * define all stats to get:
 * general: simple hardcoded list of values
 */
// all other stats
const stats = [
    "operatorpvp_tachanka_turretkill",
    "casualpvp_kills",
    "casualpvp_death",
    "casualpvp_matchlost",
    "casualpvp_matchplayed",
    "casualpvp_matchwon",
    "casualpvp_timeplayed",
    "generalpvp_bulletfired",
    "generalpvp_bullethit",
    "generalpvp_headshot",
    "generalpvp_death",
    "generalpvp_killassists",
    "generalpvp_kills",
    "generalpvp_matchlost",
    "generalpvp_matchplayed",
    "generalpvp_matchwon",
    "generalpvp_meleekills",
    "generalpvp_penetrationkills",
    "generalpvp_revive",
    "generalpvp_timeplayed",
    "rankedpvp_kills",
    "rankedpvp_death",
    "rankedpvp_matchlost",
    "rankedpvp_matchplayed",
    "rankedpvp_matchwon",
    "rankedpvp_timeplayed",
    "secureareapvp_bestscore",
    "secureareapvp_matchlost",
    "secureareapvp_matchplayed",
    "secureareapvp_matchwon",
    "secureareapvp_timeplayed",
    "rescuehostagepvp_bestscore",
    "rescuehostagepvp_matchlost",
    "rescuehostagepvp_matchplayed",
    "rescuehostagepvp_matchwon",
    "rescuehostagepvp_timeplayed",
    "plantbombpvp_bestscore",
    "plantbombpvp_matchlost",
    "plantbombpvp_matchplayed",
    "plantbombpvp_matchwon",
    "plantbombpvp_timeplayed",
    "weapontypepvp_headshot",
    "weapontypepvp_bulletfired",
    "weapontypepvp_bullethit",
    "weapontypepvp_kills",
    "operatorpvp_kills",
    "operatorpvp_death",
    "operatorpvp_roundwon",
    "operatorpvp_roundlost",
    "operatorpvp_timeplayed"
];
/**
 * helpers to map the response
 */
const operatorGetter = obj => OPERATORS.reduce(function (acc, curr) {
    acc[curr.name] = {
        name: curr.readableName,
        kills: obj[`operatorpvp_kills:${curr.fullIndex}:infinite`],
        deaths: obj[`operatorpvp_death:${curr.fullIndex}:infinite`],
        won: obj[`operatorpvp_roundwon:${curr.fullIndex}:infinite`],
        lost: obj[`operatorpvp_roundlost:${curr.fullIndex}:infinite`],
        timePlayed: obj[`operatorpvp_timeplayed:${curr.fullIndex}:infinite`]
    }
    return acc;
}, {})
const weaponGetter = obj => Object.keys(WEAPONTYPES)
    .reduce(function (acc, curr) {
        const val = WEAPONTYPES[curr];
        acc[val] = {
            kills: obj[`weapontypepvp_kills:${curr}:infinite`],
            headshot: obj[`weapontypepvp_headshot:${curr}:infinite`],
            bulletsFired: obj[`weapontypepvp_bulletfired:${curr}:infinite`],
            bulletsHit: obj[`weapontypepvp_bullethit:${curr}:infinite`],
        }
        return acc;
    }, {});
const turretGetter = obj => Object.keys(obj)
    .filter(key => /operatorpvp_tachanka_turretkill/.test(key))
    .reduce((acc, curr) => acc + obj[curr], 0)

module.exports = function (ids, opts) {
    const query = [].concat(ids);
    if (query.length > 150) {
        return Promise.reject(new TooManyIdsError("too many ids passed (max 150)"));
    }
    debug("getStats for %O", query);
    return getAuthString()
        .then(fetch(`${URLS.STATS_URL}statistics=${stats.join(",")}&populations=${query.join(",")}`))
        .then(res => res.results)
        .then(res => {
            //@TODO map res
            return Object.keys(res)
                .reduce((acc, curr) => acc.concat({
                    id: curr,
                    raw: res[curr],
                    weapon: weaponGetter(res[curr]),
                    operator: operatorGetter(res[curr]),
                    general: {
                        bulletsFired: res[curr]["generalpvp_bulletfired:infinite"],
                        bulletsHit: res[curr]["generalpvp_bullethit:infinite"],
                        headshot: res[curr]["generalpvp_headshot:infinite"],
                        deaths: res[curr]["generalpvp_death:infinite"],
                        assists: res[curr]["generalpvp_killassists:infinite"],
                        kills: res[curr]["generalpvp_kills:infinite"],
                        lost: res[curr]["generalpvp_matchlost:infinite"],
                        played: res[curr]["generalpvp_matchplayed:infinite"],
                        won: res[curr]["generalpvp_matchwon:infinite"],
                        meleeKills: res[curr]["generalpvp_meleekills:infinite"],
                        penetrationKills: res[curr]["generalpvp_penetrationkills:infinite"],
                        turretKills: turretGetter(res[curr]),
                        revives: res[curr]["generalpvp_revive:infinite"],
                        timePlayed: res[curr]["generalpvp_timeplayed:infinite"]
                    },
                    queue: {
                        casual: {
                            kills: res[curr]["casualpvp_kills:infinite"],
                            deaths: res[curr]["casualpvp_death:infinite"],
                            won: res[curr]["casualpvp_matchwon:infinite"],
                            lost: res[curr]["casualpvp_matchlost:infinite"],
                            played: res[curr]["casualpvp_matchplayed:infinite"],
                            timePlayed: res[curr]["casualpvp_timeplayed:infinite"]
                        },
                        ranked: {
                            kills: res[curr]["rankedpvp_kills:infinite"],
                            deaths: res[curr]["rankedpvp_death:infinite"],
                            won: res[curr]["rankedpvp_matchwon:infinite"],
                            lost: res[curr]["rankedpvp_matchlost:infinite"],
                            played: res[curr]["rankedpvp_matchplayed:infinite"],
                            timePlayed: res[curr]["rankedpvp_timeplayed:infinite"]
                        }
                    },
                    mode: {
                        bomb: {
                            won: res[curr]["plantbombpvp_matchwon:infinite"],
                            lost: res[curr]["plantbombpvp_matchlost:infinite"],
                            played: res[curr]["plantbombpvp_matchplayed:infinite"],
                            bestScore: res[curr]["plantbombpvp_bestscore:infinite"],
                            timePlayed: res[curr]["plantbombpvp_timeplayed:infinite"]
                        },
                        secure: {
                            won: res[curr]["secureareapvp_matchwon:infinite"],
                            lost: res[curr]["secureareapvp_matchlost:infinite"],
                            played: res[curr]["secureareapvp_matchplayed:infinite"],
                            bestScore: res[curr]["secureareapvp_bestscore:infinite"],
                            timePlayed: res[curr]["secureareapvp_timeplayed:infinite"]
                        },
                        hostage: {
                            won: res[curr]["rescuehostagepvp_matchwon:infinite"],
                            lost: res[curr]["rescuehostagepvp_matchlost:infinite"],
                            played: res[curr]["rescuehostagepvp_matchplayed:infinite"],
                            bestScore: res[curr]["rescuehostagepvp_bestscore:infinite"],
                            timePlayed: res[curr]["rescuehostagepvp_timeplayed:infinite"]
                        }
                    }
                }), []);

        })
}