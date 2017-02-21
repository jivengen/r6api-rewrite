const login = require("../test.login");
const Errors = require("../lib/errors");
const auth = require("../lib/auth");

describe("test", function () {
    it("can set and get credentials", () => {
        auth.setCredentials("test", "pass");
        expect(auth.getCredentials()).toEqual({
            email: "test",
            password: "pass"
        });
    });

    it("throws on empty params", () => {
        auth.setCredentials(null, null);
        auth.login()
            .then(res => expect(res).toBe(undefined))
            .catch(err => expect(err).toBeInstanceOf(Errors.MissingCredentialsError));
    });

    it("throws on wrong credentials", () => {
        auth.setCredentials("404.r6db.com", "notmypass");
        auth.login()
            .then(res => expect(res).toBe(undefined))
            .catch(err => expect(err).toBeInstanceOf(Errors.MissingCredentialsError));
    });

    it("resolves on correct credentials with token", () => {
        auth.setCredentials(login.email, login.password);
        auth.login()
            .then(res => expect(res).toBeDefined())
            .catch(err => expect(err).toBeUndefined());
    });

    it("returns a correct token", () => {
        auth.setCredentials(login.email, login.password);
        auth.login()
            .then(function (ubiRes) {
                auth.getAuthToken()
                    .then(token => expect(token).toContain(ubiRes.ticket));
            })
            .catch(err => expect(err).toBeUndefined())
    });

    it("schedules a refresh on successful login", () => {
        auth.setCredentials(login.email, login.password);
        auth.login()
            .then(() => expect(auth.refreshScheduled()).toBeTruthy())
            .catch(err => expect(err).toBeUndefined())
    });

    it("logs in again if a token expired", () => {
        auth.setCredentials(login.email, login.password);
        auth.login()
            .then(() => {
                auth._setAuth({ expires: new Date("2000-01-01") });
                auth.getAuthToken()
                    .then(res => expect(res).toBeDefined());
            })
            .catch(err => expect(err).toBeUndefined())
    });
});
