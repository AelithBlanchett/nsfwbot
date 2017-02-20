import {Fight} from "../../src/Fight";
import {Model} from "../../src/Model";
import {FightRepository} from "../../src/FightRepository";
import {BondageModifier, EmptyModifier} from "../../src/CustomModifiers";
import {ModifierRepository} from "../../src/ModifierRepository";
let Jasmine = require('jasmine');
let testSuite = new Jasmine();

describe("The Fight Repository", () => {

    it("should do nothing. lol.", async function (done) {
        done();
    });

    it("should try everything around modifier", async function (done) {

        let myModifier = new EmptyModifier();
        myModifier.idReceiver = "Aelith Blanchette";

        await ModifierRepository.persist(myModifier);
        let resultTrue = await ModifierRepository.exists(myModifier.idModifier);
        expect(resultTrue).toBe(true);

        await ModifierRepository.delete(myModifier.idModifier);
        let resultFalse = await ModifierRepository.exists(myModifier.idModifier);
        expect(resultFalse).toBe(false);

        await Model.db('nsfw_modifiers').where({idModifier: myModifier.idModifier}).del();

        done();
    });

});

testSuite.execute();