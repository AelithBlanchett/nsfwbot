import {Achievement} from "../src/Achievement";
var Jasmine = require('jasmine');
var jasmine = new Jasmine();


describe("The database(s)", () => {


    it("should load Aelith Blanchette", async function (done) {
        await Achievement.loadAllForFighter("Aelith Blanchette", 1);
    });

});

jasmine.execute();