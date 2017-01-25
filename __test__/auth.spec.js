const login = require("../test.login");

const Errors = require("../lib/errors/auth");
const auth = require("../lib/auth");

describe("test", function () {
    it("throws on empty params", () => {
        auth.login()
            .then(res => expect(res).toBe(undefined))
            .catch(err => expect(err).toBeInstanceOf(Errors.MissingCredentialsError));
    });

    it("throws on wrong credentials", () => {
        auth.login("404@r6db.com", "notmypass")
            .then(res => expect(res).toBe(undefined))
            .catch(err => expect(err).toBeInstanceOf(Errors.MissingCredentialsError));
    });

    it("resolves on correct credentials with token", () => {
        auth.login(login.email, login.password)
            .then(res => {
                expect(res).toBeDefined();
            })
            .catch(err => expect(err).toBeUndefined());
    });
})
