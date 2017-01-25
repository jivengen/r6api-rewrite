const login = require("../test.login");

const Errors = require("../lib/errors/auth");
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
                    .then(token => expect(ubiRes.ticket).toEqual(localRes));
            });
    });

    it("returns correct auth Headers", () => {
        auth.setCredentials(login.email, login.password)
        auth.getAuthHeader()
            .then(headers => {
                expect(headers["Ubi-AppId"]).toBeDefined();
                expect(headers["Authorization"]).toContain("Ubi_v1 t=");
            });
    })

    it("schedules a refresh on successful login", () => {
        auth.setCredentials(login.email, login.password);
        auth.login()
            .then(() => expect(auth.refreshScheduled()).toBeTruthy());
    })
});
