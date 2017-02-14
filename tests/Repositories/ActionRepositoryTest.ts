import {Action, ActionType} from "../../src/Action";
import {ActionRepository} from "../../src/ActionRepository";
import {Utils} from "../../src/Utils";
let Jasmine = require('jasmine');
let testSuite = new Jasmine();

describe("The Action Repository", () => {

    it("should do nothing. lol.", async function (done) {
        done();
    });

    it("should delete action aa", async function (done) {

        let myAction = new Action();
        myAction.idAction = Utils.generateUUID();
        myAction.idFight = 1;
        myAction.idAttacker = "Aelith Blanchette";
        myAction.atTurn = 1;
        myAction.tier = 0;
        myAction.missed = false;
        myAction.isHold = false;
        myAction.type =  ActionType.Bondage;
        await ActionRepository.persist(myAction);
        let resultTrue = await ActionRepository.exists(myAction.idAction);
        expect(resultTrue).toBe(true);

        await ActionRepository.delete(myAction.idAction);
        let resultFalse = await ActionRepository.exists(myAction.idAction);
        expect(resultFalse).toBe(false);
        done();
    });

    it("should say that action that was just inserted is in database.", async function (done) {
        let myAction = new Action();
        myAction.idAction = Utils.generateUUID();
        myAction.idFight = 1;
        myAction.idAttacker = "Aelith Blanchette";
        myAction.atTurn = 1;
        myAction.tier = 0;
        myAction.missed = false;
        myAction.isHold = false;
        myAction.type =  ActionType.Bondage;
        await ActionRepository.persist(myAction);
        let resultTrue = await ActionRepository.exists(myAction.idAction);
        expect(resultTrue).toBe(true);
        done();
    });

    it("should save an action in the database.", async function (done) {
        let myAction = new Action();
        myAction.idAction = Utils.generateUUID();
        myAction.idFight = 1;
        myAction.idAttacker = "Aelith Blanchette";
        myAction.atTurn = 1;
        myAction.tier = 0;
        myAction.missed = false;
        myAction.isHold = false;
        myAction.type =  ActionType.Bondage;
        await ActionRepository.persist(myAction);

        expect(myAction.createdAt).toBeDefined();
        done();
    });

    it("should load all actions from fight #1", async function (done) {
        let actions = await ActionRepository.loadFromFight("1");
        expect(actions.length).toBeGreaterThan(0);
        done();
    });

});

testSuite.execute();