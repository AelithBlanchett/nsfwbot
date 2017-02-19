/**
 * Created by Canardlaquay on 18/févr./2017.
 */
import {Action, ActionType} from "../../src/Action";
import {ActionRepository} from "../../src/ActionRepository";
import {Utils} from "../../src/Utils";
import {ActiveFighter} from "../../src/ActiveFighter";
import {ActiveFighterRepository} from "../../src/ActiveFighterRepository";
import {Team} from "../../src/Constants";
import {FightStatus} from "../../src/Fight";
import {Model} from "../../src/Model";
import {Fighter} from "../../src/Fighter";
import {FighterRepository} from "../../src/FighterRepository";
let Jasmine = require('jasmine');
let testSuite = new Jasmine();

describe("The Fighter Repository", () => {

    beforeEach(async () =>{
        //await Model.db('nsfw_fighters').del();
    });

    it("should do nothing. lol.", async function (done) {
        done();
    });

    it("should do all tests around Fighter Aelith Blanchetts", async function (done) {

        let myFighter = new Fighter();
        myFighter.name = "Aelith Blanchetts";

        await Model.db('nsfw_fighters').where({name: myFighter.name, season: 1}).del();

        await FighterRepository.persist(myFighter);
        let resultTrue = await FighterRepository.exists(myFighter.name);
        expect(resultTrue).toBe(true);

        await FighterRepository.delete(myFighter.name);
        let resultFalse = await FighterRepository.exists(myFighter.name);
        expect(resultFalse).toBe(false);

        await Model.db('nsfw_fighters').where({name: myFighter.name, season: 1}).del();

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