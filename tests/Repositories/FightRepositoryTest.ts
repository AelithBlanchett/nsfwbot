import {Fight} from "../../src/Fight";
import {Model} from "../../src/Model";
import {FightRepository} from "../../src/FightRepository";
let Jasmine = require('jasmine');
let testSuite = new Jasmine();

describe("The Fight Repository", () => {

    it("should do nothing. lol.", async function (done) {
        done();
    });

    it("should try everything around fight 1", async function (done) {

        let myFight = new Fight();

        await FightRepository.persist(myFight);
        let resultTrue = await FightRepository.exists(myFight.idFight);
        expect(resultTrue).toBe(true);

        await FightRepository.delete(myFight.idFight);
        let resultFalse = await FightRepository.exists(myFight.idFight);
        expect(resultFalse).toBe(false);

        await Model.db('nsfw_fights').where({idFight: myFight.idFight}).del();

        done();
    });

    // it("should say that action that was just inserted is in database.", async function (done) {
    //     let myFighter = new Fighter();
    //     myFighter.name = "Aelith Blanchette";
    //
    //     await ActiveFighterRepository.persist(myFighter);
    //     let resultTrue = await ActiveFighterRepository.exists(myFighter.name, myFighter.idFight);
    //     expect(resultTrue).toBe(true);
    //     done();
    // });
    //
    // it("should save an action in the database.", async function (done) {
    //     let myFighter = new ActiveFighter();
    //     myFighter.initialize();
    //     myFighter.name = "Aelith Blanchette";
    //     myFighter.idFight = "1";
    //     myFighter.season = 0;
    //     myFighter.assignedTeam = Team.Blue;
    //     myFighter.isReady = true;
    //
    //     await ActiveFighterRepository.persist(myFighter);
    //
    //     expect(myFighter.createdAt).toBeDefined();
    //     done();
    // });
    //
    // it("should load all actions from fight #1", async function (done) {
    //     let myFighter = new ActiveFighter();
    //     myFighter.initialize();
    //     myFighter.name = "Aelith Blanchette";
    //     myFighter.idFight = "1";
    //     myFighter.season = 0;
    //     myFighter.assignedTeam = Team.Blue;
    //     myFighter.isReady = true;
    //
    //     await ActiveFighterRepository.persist(myFighter);
    //
    //     let actors = await ActiveFighterRepository.loadFromFight("1");
    //     expect(actors.length).toBeGreaterThan(0);
    //     done();
    // });

});

testSuite.execute();