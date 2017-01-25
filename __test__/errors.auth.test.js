const Errors = require("../lib/errors/auth");

describe("auth errors", function() {
    it("extends the base Error class", function () {
        Object.keys(Errors)
            .map(function (key) {
                let Err = Errors[key];
                expect(new Err()).toBeInstanceOf(Error)
            });
    });
})