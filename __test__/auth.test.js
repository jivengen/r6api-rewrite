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

    it("throws on empty params", done => {
        auth.setCredentials(null, null);
        auth.login()
            .then(res => {
                expect(res).toBe(undefined);
                done();
            })
            .catch(err => {
                expect(err).toBeInstanceOf(Errors.MissingCredentialsError);
                done();
            });
    });

    it("throws on wrong credentials", done => {
        auth.setCredentials("404.r6db.com", "notmypass");
        auth.login()
            .then(res => {
                expect(res).toBe(undefined);
                done();
            })
            .catch(err => {
                expect(err).toBeInstanceOf(Errors.MissingCredentialsError);
                done();
            });
    });

    it("resolves on correct credentials with token", () => {
        auth.setCredentials(login.email, login.password);
        return auth.login()
            .then(res => {
                expect(res).toBeDefined();
            });
    });

    it("returns a correct token", done => {
        auth.setCredentials(login.email, login.password);
        return auth.login()
            .then(function (ubiRes) {
                auth.getAuthToken()
                    .then(token => {
                        expect(token).toEqual(ubiRes.ticket);
                        done();
                    });
            });
    });

    it("schedules a refresh on successful login", () => {
        auth.setCredentials(login.email, login.password);
        return auth.login()
            .then(() => expect(auth.refreshScheduled()).toBeTruthy());
    });

    it("logs in again if a token expired", () => {
        auth.setCredentials(login.email, login.password);
        return auth.login()
            .then(() => {
                auth._setAuth({ expires: new Date("2000-01-01") });
                auth.getAuthToken()
                    .then(res => expect(res).toBeDefined());
            });
    });
});
