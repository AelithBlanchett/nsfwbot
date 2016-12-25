import {Achievement} from "../src/Achievement";
import {Action} from "../src/Action";
import {Fight} from "../src/Fight";
var Jasmine = require('jasmine');
var jasmine = new Jasmine();


describe("The database(s)", () => {


    it("should load Aelith Blanchette", async function (done) {
        await Action.save(new Action(new Fight(null, null, null), 1, 0, 1, null));
    });

});

jasmine.execute();