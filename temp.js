const auth = require("./lib/auth");
const fixture = require("./test.login");

auth.login(fixture.email, fixture.password)
    .then(console.log)
    .catch(console.error);