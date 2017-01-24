const test = require("tape");
const { ERRORS } = require("../lib/constants");

const auth = require("../lib/auth");

test("throws on empty params", t => {
    auth.login()
        .then(res => {
            t.fail("login did not fail");
            t.end();
        })
        .catch(err => {
            t.equal(err, ERRORS.AUTH_INVALID_EMAIL, "did not throw 'invalid email format' error");
            t.end();
        })
});

test("throws on wrong credentials", t => {
    auth.login("laxis@r6db.com", "notmypass")
        .then(res => {
            t.fail("login did not fail");
            t.end();
        })
        .catch(err => {
            t.equal(err, ERRORS.AUTH_INVALID_CREDENTIALS);
            t.end();
        })
});

test("resolves on correct credentials with token", t => {
    auth.login("laxis@r6db.com", "laxisbliebeshase")
        .then(res => {
            t.ok(res.length > 0, "no token");
            t.end();
        })
        .catch(err => {
            t.fail("login failed");
            t.end();
        })
});