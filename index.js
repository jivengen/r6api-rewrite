const auth = require("./lib/auth");
const errors = require("./lib/errors")
const findByName = require("./lib/commands/findByName");

module.exports.auth = auth;
module.exports.errors = errors;
module.exports.api = {
    findByName
}