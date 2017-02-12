import {Fighter} from "../src/Fighter";
import {Fight} from "../src/Fight";
import {IFChatLib} from "../src/interfaces/IFChatLib";
import {CommandHandler} from "../src/CommandHandler";
import * as Constants from "../src/Constants";
import Tier = Constants.Tier;
import {Utils} from "../src/Utils";
import {Action, ActionType} from "../src/Action";
import {ItemPickupModifier} from "../src/CustomModifiers";
import {ModifierType} from "../src/Constants";
import {Feature} from "../src/Feature";
import {FeatureType} from "../src/Constants";
import {ActiveFighter} from "../src/ActiveFighter";
import {FighterRepository} from "../src/FighterRepository";
import {ActionRepository} from "../src/ActionRepository";
var waitUntil = require('wait-until');
var Jasmine = require('jasmine');
var jasmine = new Jasmine();
var fChatLibInstance: any;
var debug = false;
var mockedClasses = [];
var usedIndexes = [];
var usedFighters = [];

async function initiateMatchSettings2vs2TagForDb(cmdHandler) {
        cmdHandler.fight.setFightType("tagteam");
    await cmdHandler.join("Red", {character: "test2", channel: "here"});
    await cmdHandler.join("Purple", {character: "test3", channel: "here"});
    await cmdHandler.join("Purple", {character: "test4", channel: "here"});
    await cmdHandler.join("Red", {character: "test1", channel: "here"});
    await cmdHandler.ready("Red", {character: "test3", channel: "here"});
    await cmdHandler.ready("Red", {character: "test4", channel: "here"});
    await cmdHandler.ready("Red", {character: "test1", channel: "here"});
    await cmdHandler.ready("Red", {character: "test2", channel: "here"});
}

describe("The database(s)", () => {

    async function resetData() {
        let firstFighter = new Fighter();
        firstFighter.name = "test1";
        let secondFighter = new Fighter();
        secondFighter.name = "test2";
        let thirdFighter = new Fighter();
        thirdFighter.name = "test3";
        let fourthFighter = new Fighter();
        fourthFighter.name = "test4";

        await FighterRepository.persist(firstFighter);
        await FighterRepository.persist(secondFighter);
        await FighterRepository.persist(thirdFighter);
        await FighterRepository.persist(fourthFighter);
    }

    beforeAll(async function (done) {
        await resetData();
        done();
    },5000);

    beforeEach(function () {
        fChatLibInstance = {
            sendMessage: function (message:string, channel:string) {
                if (debug) {
                    console.log("Sent MESSAGE " + message + " on channel " + channel);
                }
            },
            throwError: function (s:string) {
                if (debug) {
                    console.log("Sent ERROR " + s);
                }
            },
            sendPrivMessage: function (character:string, message:string) {
                if (debug) {
                    console.log("Sent PRIVMESSAGE " + message + " to " + character);
                }
            },
            addPrivateMessageListener: function (fn: any){

            },
            isUserChatOP: function(username: string, channel: string){
                return username == "Aelith Blanchette";
            }
        };

        spyOn(fChatLibInstance, 'sendMessage').and.callThrough();
        spyOn(fChatLibInstance, 'throwError').and.callThrough();
        spyOn(fChatLibInstance, 'sendPrivMessage').and.callThrough();
    });

    xit("should load Aelith Blanchette", async function (done) {
        let fighter = await FighterRepository.load("Aelith Blanchette");
        expect(fighter.name).toBe("Aelith Blanchette");
        done();
    });

    xit("should give ItemPickupBonus feature to Test2", function (done) {
        FighterRepository.load("test2").then(x => {
            x.features.push(new Feature(x.name, FeatureType.KickStart, 1));
            FighterRepository.persist(x).then(updWorked => {
                expect(updWorked).toBe(true);
                done();
            }).catch(err => {
                done.fail(err);
            });
        }).catch(err => {
            done.fail(err);
        });
    },500000);

    xit("should say test1 is already there", function (done) {
        FighterRepository.load("test1").then(x => {
            if (x.name == "test1") {
                done();
            }
            else{
                done.fail(new Error("Test wasn't found in the database."));
            }
        }).catch(err => {
            done.fail(err);
        });
    },5000);

    xit("should say Test2 is already there", function (done) {
        FighterRepository.load("test2").then(x => {
            if(x.name == "test2"){
                done();
            }
            else{
                done.fail(new Error("Test2 wasn't found in the database."));
            }
        }).catch(err => {
            done.fail(err);
        });
    },5000);

    xit("should say Tewefwefwfwst2 doesn't exist", function (done) {
        FighterRepository.load("Tewefwefwfwst2").then(x => {
            if(x == undefined){
                done();
            }
            else{
                done.fail(new Error("Fighter shouldn't have been found in the database."));
            }
        }).catch(err => {
            done.fail(err);
        });
    },5000);

    xit("should update Test2's power to something else", function (done) {
        FighterRepository.load("test2").then(x => {
            let randomId = -1;
            do{
                randomId = Utils.getRandomInt(1,6);
            }while(x.power == randomId);
            x.power = randomId;
            FighterRepository.persist(x).then(updWorked => {
                expect(updWorked).toBe(true);
                done();
            }).catch(err => {
                done.fail(err);
            });
        }).catch(err => {
            done.fail(err);
        });
    },500000);

    //xit("should write a new action in the database", async function (done) {
    //    ActiveFighter.load("test2").then(x => {
    //        let fight = new Fight(null, null);
    //        let myAction = new Action(fight, 1, 1, ActionType.Brawl, x);
    //        Action.commitDb(myAction).then(idAction => {
    //            expect(idAction).toBeGreaterThan(0);
    //            done();
    //        }).catch(err => {
    //            done.fail(err);
    //        });
    //    });
    //},5000);
    //
    //it("should write a new fight in the database", function (done) {
    //    Fighter.load("test2").then(x => {
    //        let myFight = new Fight(fChatLibInstance, "here", "hello");
    //        Fight.saveState(myFight).then(idAction => {
    //            expect(idAction).toBeGreaterThan(0);
    //            done();
    //        }).catch(err => {
    //            done.fail(err);
    //        });
    //    });
    //},50000);

    xit("should tag successfully with Aelith", async function (done) {
        debug = true;
        var cmd = new CommandHandler(fChatLibInstance, "here");
        await initiateMatchSettings2vs2TagForDb(cmd);
        waitUntil().interval(10).times(50).condition(() => {
            return cmd.fight.fighters.findIndex(x => x.name == "test1") != -1;
        }).done(() => {
            waitUntil().interval(100).times(50).condition(() => {
                return (cmd.fight.hasStarted && cmd.fight.waitingForAction);
            }).done((res) => {
                if (res) {
                    cmd.fight.setCurrentPlayer("test1");
                    cmd.tag("test2", {character: "test1", channel: "here"});
                    waitUntil().interval(100).times(50).condition(() => {
                        return (cmd.fight.currentPlayer != undefined && cmd.fight.currentPlayer.name != "test2");
                    }).done(() => {
                        done();
                    });
                }
                else {
                    done.fail(res);
                }
            });
        });
    }, 80000);

    it("should create an action", async function (done) {
        let action = new Action();
        action.buildAction(new Fight(null, null, null), 1, 0, 1, null);
        await ActionRepository.persist(action);
    });

    xit("should delete something", async function (done) {
        await ActionRepository.delete("7a1ee8c5-58bd-41f5-a0db-7bd1a533f43c");
    }, 100000);
});

jasmine.execute();