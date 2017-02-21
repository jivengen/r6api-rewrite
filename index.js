const auth = require("./lib/auth");
const errors = require("./lib/errors")
const findByName = require("./lib/commands/findByName");
const getCurrentName = require("./lib/commands/getCurrentName");
const getLevel = require("./lib/commands/getLevel");
const getPlaytime = require("./lib/commands/getPlaytime");
const getRank = require("./lib/commands/getRank");
const getStats = require("./lib/commands/getStats");

module.exports.auth = auth;
module.exports.errors = errors;
module.exports.api = {
    findByName,
    getCurrentName,
    getLevel,
    getPlaytime,
    getRank,
    getStats
}