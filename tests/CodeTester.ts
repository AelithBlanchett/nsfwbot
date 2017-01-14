import {Achievement} from "../src/Achievement";
import {Action} from "../src/Action";
import {Fight} from "../src/Fight";
var Jasmine = require('jasmine');
var jasmine = new Jasmine();


describe("The database(s)", () => {


    xit("should load Aelith Blanchette", async function (done) {
        await Action.save(new Action(new Fight(null, null, null), 1, 0, 1, null));
    });

    xit("should ddelete something", async function (done) {
        await Action.delete("7a1ee8c5-58bd-41f5-a0db-7bd1a533f43c");
    }, 100000);

    it("should load Aelith Blanchette", async function (done) {
        await Action.load("aa");
    });

});

jasmine.execute();