import {Fighter} from "../plugins/NSFWClasses/Fighter";
import {Fight} from "../plugins/NSFWClasses/Fight";
import {IFChatLib} from "../plugins/NSFWClasses/interfaces/IFChatLib";
import {CommandHandler} from "../plugins/NSFWClasses/CommandHandler";
import * as Constants from "../plugins/NSFWClasses/Constants";
import Tier = Constants.Tier;
import {Utils} from "../plugins/NSFWClasses/Utils";
import {Action, ActionType} from "../plugins/NSFWClasses/Action";
import {Data} from "../plugins/NSFWClasses/Model";
import {Promise} from "es6-promise";
import {ItemPickupModifier} from "../plugins/NSFWClasses/CustomModifiers";
import {ModifierType} from "../plugins/NSFWClasses/Constants";
import {Feature} from "../plugins/NSFWClasses/Feature";
import {FeatureType} from "../plugins/NSFWClasses/Constants";
var waitUntil = require('wait-until');
var Jasmine = require('jasmine');
var jasmine = new Jasmine();
var fChatLibInstance: any;
var debug = false;
var mockedClasses = [];
var usedIndexes = [];
var usedFighters = [];

function initiateMatchSettings2vs2TagForDb(cmdHandler){
    return new Promise((resolve, reject) => {
        cmdHandler.fight.setFightType("tagteam");
        cmdHandler.join("Red", {character: "test2", channel: "here"});
        cmdHandler.join("Purple", {character: "test3", channel: "here"});
        cmdHandler.join("Purple", {character: "test4", channel: "here"});
        cmdHandler.join("Red", {character: "test", channel: "here"});
        cmdHandler.ready("Red", {character: "test3", channel: "here"});
        cmdHandler.ready("Red", {character: "test4", channel: "here"});
        cmdHandler.ready("Red", {character: "test", channel: "here"});
        cmdHandler.ready("Red", {character: "test2", channel: "here"});
        resolve();
    });
}

describe("The database(s)", () => {

    function resetData(){
        return new Promise((resolve, reject) => {
            //var subRequestFights = "SELECT flistplugins.nsfw_fights.idFight FROM flistplugins.nsfw_fights LEFT JOIN flistplugins.nsfw_fightfighters ON flistplugins.nsfw_fights.idFight = flistplugins.nsfw_fightfighters.idFight\
            //WHERE idFighter IS NULL OR idFighter = 1 OR idFighter = 2 OR idFighter = 3 OR idFighter = 4";
            //var sqlResetFightsActions = "DELETE FROM flistplugins.nsfw_actions where idFight IN ("+subRequestFights+") OR idAttacker = 1 OR idAttacker = 2 OR idAttacker = 3 OR idAttacker = 4 OR idDefender = 1 OR idDefender = 2 OR idDefender = 3 OR idDefender = 4";
            //var sqlResetFightFighters = "DELETE FROM flistplugins.nsfw_fightfighters where idFight IN ("+subRequestFights+") OR idFighter = 1 OR idFighter = 2 OR idFighter = 3 OR idFighter = 4;";
            //var sqlResetFights = "DELETE flistplugins.nsfw_fights.* FROM flistplugins.nsfw_fights \
            //WHERE idFight IN ("+subRequestFights+") idFighter IS NULL OR idFighter = 1 OR idFighter = 2 OR idFighter = 3 OR idFighter = 4;"; //clear all fights linked to the 4 fighters
            //var sqlResetTestFighters = "DELETE FROM flistplugins.nsfw_fighters where name = 'test' OR name = 'test2' OR name = 'test3' OR name = 'test4';";
            //var sqlAddTestFighter1 = "INSERT INTO flistplugins.nsfw_fighters VALUES ('1', 'test', '0', '0', '0', '0', '0', '0', '0.00', '1', '1', '1', '1', '1', '1', '1', '0');";
            //var sqlAddTestFighter2 = "INSERT INTO flistplugins.nsfw_fighters VALUES ('2', 'test2', '0', '0', '0', '0', '0', '0', '0.00', '1', '1', '1', '1', '1', '1', '1', '0');";
            //var sqlAddTestFighter3 = "INSERT INTO flistplugins.nsfw_fighters VALUES ('3', 'test3', '0', '0', '0', '0', '0', '0', '0.00', '1', '1', '1', '1', '1', '1', '1', '0');";
            //var sqlAddTestFighter4 = "INSERT INTO flistplugins.nsfw_fighters VALUES ('4', 'test4', '0', '0', '0', '0', '0', '0', '0.00', '1', '1', '1', '1', '1', '1', '1', '0');";
            //var addFight = "INSERT INTO `flistplugins`.`nsfw_fights` (`idFight`, `idFightType`,  `idStage`, `usedTeams`, `currentTurn`, `fighterList`, `hasEnded`) VALUES (1,1, 1,2, 2, '', 0);";
            //Data.db.query(sqlResetFightsActions, (err, result) => {
            //    Data.db.query(sqlResetFightFighters, (err, result) => {
            //        Data.db.query(sqlResetFights, (err, result) => {
            //            Data.db.query(sqlResetTestFighters, (err, result) => {
            //                Data.db.query(sqlAddTestFighter1, (err, result) => {
            //                    Data.db.query(sqlAddTestFighter2, (err, result) => {
            //                        Data.db.query(sqlAddTestFighter3, (err, result) => {
            //                            Data.db.query(sqlAddTestFighter4, (err, result) => {
            //                                Data.db.query(addFight, (err, result) => {
            //                                    resolve();
            //                                });
            //                            });
            //                        });
            //                    });
            //                });
            //            });
            //        });
            //    });
            //});
        });
    }

    beforeAll(function(done) {
        resetData().then(() => {
            done();
        });
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

    it("should give ItemPickupBonus feature to Test2", function (done) {
        Fighter.exists("test2").then(x => {
            console.log(x.features);
            x.features.push(new Feature(FeatureType.KickStart, 1));
            console.log(x.features);
            x.update().then(updWorked => {
                expect(updWorked).toBe(true);
                done();
            }).catch(err => {
                done.fail(err);
            });
        }).catch(err => {
            done.fail(err);
        });
    },500000);

    xit("should say Test is already there", function (done) {
        Fighter.exists("test").then(x => {
            if(x.name == "test"){
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
        Fighter.exists("test2").then(x => {
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
        Fighter.exists("Tewefwefwfwst2").then(x => {
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
        Fighter.exists("test2").then(x => {
            let randomId = -1;
            do{
                randomId = Utils.getRandomInt(1,6);
            }while(x.power == randomId);
            x.power = randomId;
            x.update().then(updWorked => {
                expect(updWorked).toBe(true);
                done();
            }).catch(err => {
                done.fail(err);
            });
        }).catch(err => {
            done.fail(err);
        });
    },500000);

    xit("should write a new action in the database", function (done) {
        //TODO: Adapt to active fighter
        //Fighter.exists("test2").then(x => {
        //    let fight = new Fight(null, null);
        //    let myAction = new Action(fight, 1, 1, ActionType.Brawl, x);
        //    Action.commitDb(myAction).then(id => {
        //        expect(id).toBeGreaterThan(0);
        //        done();
        //    }).catch(err => {
        //        done.fail(err);
        //    });
        //});
    },5000);

    xit("should write a new fight in the database", function (done) {
        Fighter.exists("test2").then(x => {
            let myFight = new Fight(fChatLibInstance, "here", "hello");
            Fight.saveState(myFight).then(id => {
                expect(id).toBeGreaterThan(0);
                done();
            }).catch(err => {
                done.fail(err);
            });
        });
    },50000);

    xit("should tag successfully with Aelith", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings2vs2TagForDb(cmd);
        waitUntil().interval(2).times(5000).condition(() => {
            return cmd.fight.findFighterIndex(x => x.name == "test") != -1;
        }).done(() => {
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                cmd.fight.setCurrentPlayer("test");
                cmd.tag("test2", {character: "test", channel: "here"});
                waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.currentPlayer != undefined && cmd.fight.currentPlayer.name != "test2");}).done(() =>{
                    done();
                });
            });
        });
    },8000);
});

jasmine.execute();