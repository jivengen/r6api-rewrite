const login = require("../test.login");
const auth = require("../lib/auth");
const findByName = require("../lib/commands/findByName"); 

const acc = {
    LaxisSmurf: { alias: "NaCleptic", id: "532dae03-7c7f-42a1-89d4-f5bbd8f67573" },
    Muppet: { alias: "NaughtyMuppet", id: "ccd28cc4-845e-4726-8cf8-e2cac4de82a2"}
};



describe("test", function () {
    it("can find a single account", () => {
        return auth.login(login.email, login.password)
            .then(() => findByName(acc.LaxisSmurf.alias))
            .then(res => {
                expect(res.length).toBe(1);
                expect(res[0].id).toBe(acc.LaxisSmurf.id);
            });
    });
    it("can find multiple accounts", () => {
        return auth.login(login.email, login.password)
            .then(() => findByName([acc.LaxisSmurf.alias, acc.Muppet.alias]))
            .then(res => {
                expect(res.length).toBe(2);
            });
    });
});    
