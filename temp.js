const r6api = require("./index");
const fixture = require("./test.login");

r6api.auth.login(fixture.email, fixture.password)   
    .then(() => r6api.api.findByName(["NaCleptic"]))
    .then(res => {
        console.log(res);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });