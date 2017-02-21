const r6api = require("./index");
const fixture = require("./test.login");
const debug = require("debug")("temp");
const log = res => { debug("%O", res); return res; }

r6api.auth.login(fixture.email, fixture.password)   
    .then(() => r6api.api.findByName(["LaxisB"]))
    .then(res => r6api.api.getRank(res[0].id), 5)
    .then(res => {
        console.log(JSON.stringify(res, null, 2));
    })
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });