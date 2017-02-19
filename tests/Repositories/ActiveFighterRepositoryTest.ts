import {Action, ActionType} from "../../src/Action";
import {ActionRepository} from "../../src/ActionRepository";
import {Utils} from "../../src/Utils";
import {ActiveFighter} from "../../src/ActiveFighter";
import {ActiveFighterRepository} from "../../src/ActiveFighterRepository";
import {Team} from "../../src/Constants";
import {FightStatus} from "../../src/Fight";
import {Model} from "../../src/Model";
let Jasmine = require('jasmine');
let testSuite = new Jasmine();

describe("The Active Fighter Repository", () => {

    beforeEach(async () =>{
        await Model.db('nsfw_activefighters').del();
    });

    it("should do nothing. lol.", async function (done) {
        done();
    });

    it("should delete Active Fighter Aelith", async function (done) {

        let myFighter = new ActiveFighter();
        myFighter.initialize();
        myFighter.name = "Aelith Blanchette";
        myFighter.idFight = "1";
        myFighter.season = 0;
        myFighter.assignedTeam = Team.Blue;
        myFighter.isReady = true;
        myFighter.fightStatus = FightStatus.Playing;


        await ActiveFighterRepository.persist(myFighter);
        let resultTrue = await ActiveFighterRepository.exists(myFighter.name, myFighter.idFight);
        expect(resultTrue).toBe(true);

        await ActiveFighterRepository.delete(myFighter.name, myFighter.idFight);
        let resultFalse = await ActiveFighterRepository.exists(myFighter.name, myFighter.idFight);
        expect(resultFalse).toBe(false);
        done();
    });

    it("should say that Active Fighter that was just inserted is in database.", async function (done) {
        let myFighter = new ActiveFighter();
        myFighter.initialize();
        myFighter.name = "Aelith Blanchette";
        myFighter.idFight = "1";
        myFighter.season = 0;
        myFighter.assignedTeam = Team.Blue;
        myFighter.isReady = true;

        await ActiveFighterRepository.persist(myFighter);
        let resultTrue = await ActiveFighterRepository.exists(myFighter.name, myFighter.idFight);
        expect(resultTrue).toBe(true);
        done();
    });

    it("should save an Active Fighter in the database.", async function (done) {
        let myFighter = new ActiveFighter();
        myFighter.initialize();
        myFighter.name = "Aelith Blanchette";
        myFighter.idFight = "1";
        myFighter.season = 0;
        myFighter.assignedTeam = Team.Blue;
        myFighter.isReady = true;

        await ActiveFighterRepository.persist(myFighter);

        expect(myFighter.createdAt).toBeDefined();
        done();
    });

    it("should load all Active Fighter from fight #1", async function (done) {
        let myFighter = new ActiveFighter();
        myFighter.initialize();
        myFighter.name = "Aelith Blanchette";
        myFighter.idFight = "1";
        myFighter.season = 0;
        myFighter.assignedTeam = Team.Blue;
        myFighter.isReady = true;

        await ActiveFighterRepository.persist(myFighter);

        let actors = await ActiveFighterRepository.loadFromFight("1");
        expect(actors.length).toBeGreaterThan(0);
        done();
    });

});

testSuite.execute();