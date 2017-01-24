const auth = require("./lib/auth");

auth.login()
    .then(console.log)
    .catch(console.error);