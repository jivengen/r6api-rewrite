const auth = require("./lib/auth");
const fixture = require("./test.login");
const findByName = require("./lib/commands/findByName")

auth.login(fixture.email, fixture.password)
    .then(() => findByName(["NaCleptic"]))
    .then(res => {
        console.log(res);
        process.exit(0);
    })
    .catch(console.error);