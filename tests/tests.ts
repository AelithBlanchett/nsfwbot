import {Fighter} from "../plugins/NSFWClasses/Fighter";
import {Fight} from "../plugins/NSFWClasses/Fight";
import {IFChatLib} from "../plugins/NSFWClasses/interfaces/IFChatLib";
import {CommandHandler} from "../plugins/NSFWClasses/CommandHandler";
import {Constants} from "../plugins/NSFWClasses/Constants";
import Tier = Constants.Tier;
import {Utils} from "../plugins/NSFWClasses/Utils";
import {FightAction} from "../plugins/NSFWClasses/FightAction";
import Action = Constants.Action;
import {Data} from "../plugins/NSFWClasses/Model";

var waitUntil = require('wait-until');
var Jasmine = require('jasmine');
var jasmine = new Jasmine();
var fChatLibInstance: any;
var debug = false;
var mockedClasses = [];
var usedIndexes = [];
var usedFighters = [];

function getMock(mockedClass) {
    if(mockedClasses.indexOf(mockedClass) != -1){
        return new mockedClasses[mockedClasses.indexOf(mockedClass)]();
    }
    Object.getOwnPropertyNames(mockedClass.prototype).forEach(m => spyOn(mockedClass.prototype, m).and.callThrough());
    mockedClasses.push(mockedClass);

    return new mockedClass();
}

//
//Abstraction of database layer
//

function abstractDatabase(){

    Fighter.exists = function(name){
        return new Promise(function(resolve, reject) {
            resolve(createFighter(name));
        });
    };

    FightAction.commitDb = function(action){
        return new Promise<number>(function(resolve, reject) {
            action.id = Utils.getRandomInt(0,1000000);
            resolve(action.id);
        });
    };

    Fight.commitEndFightDb = function(fight){
        return true;
    };

    Fight.saveState = function(fight){
        return new Promise<number>(function(resolve, reject) {
            resolve(Utils.getRandomInt(0,1000000));
        });
    };

    Fight.loadState = function(id, fight){
        fight.id = id;
        return true;
    };
}

//Utilities

function createFighter(name, intStatsToAssign:number = 3):Fighter{
    let myFighter;
    if(usedFighters.findIndex(x => x.name == name) == -1){
        myFighter = getMock(Fighter);
        let randomId = -1;
        do{
            randomId = Utils.getRandomInt(0,1000000);
        }while(usedIndexes.indexOf(randomId) != -1);
        myFighter.id = randomId;
        myFighter.name = name;
        myFighter.power = myFighter.sensuality = myFighter.endurance = myFighter.toughness = myFighter.willpower = myFighter.dexterity = intStatsToAssign;
        myFighter.hp = myFighter.hpPerHeart();
        myFighter.heartsRemaining = myFighter.maxHearts();
        myFighter.lust = 0;
        myFighter.orgasmsRemaining = myFighter.maxOrgasms();
        myFighter.focus = myFighter.willpower;
        usedFighters.push(myFighter);
    }
    else{
        myFighter = usedFighters.find(x => x.name == name);
    }

    return myFighter;
}

function doAction(cmd:CommandHandler, action:string, target:string = "", condition?:any){
    return new Promise((resolve, reject) => {
        if(!condition){
            condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
        }
        waitUntil().interval(100).times(50).condition(condition).done(() => {
            cmd.fight.currentPlayer.dice.addMod(50);
            cmd[action](target, {character: cmd.fight.currentPlayer.name, channel: "here"});
            waitUntil().interval(100).times(50).condition(condition).done(() => {
                resolve();
            });
        });
    });
}

function wasHealthHxit(cmd:CommandHandler, name:string){
    return (
        (
            cmd.fight.fighterList.getFighterByName(name).hp == cmd.fight.fighterList.getFighterByName(name).hpPerHeart() &&
            cmd.fight.fighterList.getFighterByName(name).heartsRemaining < cmd.fight.fighterList.getFighterByName(name).maxHearts()
        )
        ||
        cmd.fight.fighterList.getFighterByName(name).hp < cmd.fight.fighterList.getFighterByName(name).hpPerHeart()
    );
}

function wasLustHxit(cmd:CommandHandler, name:string){
    return (
        (
            cmd.fight.fighterList.getFighterByName(name).lust == cmd.fight.fighterList.getFighterByName(name).lustPerOrgasm() &&
            cmd.fight.fighterList.getFighterByName(name).orgasmsRemaining < cmd.fight.fighterList.getFighterByName(name).maxOrgasms()
        )
        ||
        cmd.fight.fighterList.getFighterByName(name).lust < cmd.fight.fighterList.getFighterByName(name).lustPerOrgasm()
    );
}

function initiateMatchSettings2vs2Tag(cmdHandler){
    return new Promise((resolve, reject) => {
        cmdHandler.fight.setFightType("tagteam");
        cmdHandler.join("Red", {character: "Aelith Blanchette", channel: "here"});
        cmdHandler.join("Purple", {character: "Purple1", channel: "here"});
        cmdHandler.join("Purple", {character: "Purple2", channel: "here"});
        cmdHandler.join("Red", {character: "TheTinaArmstrong", channel: "here"});
        cmdHandler.ready("Red", {character: "TheTinaArmstrong", channel: "here"});
        cmdHandler.ready("Red", {character: "Aelith Blanchette", channel: "here"});
        cmdHandler.ready("Red", {character: "Purple1", channel: "here"});
        cmdHandler.ready("Red", {character: "Purple2", channel: "here"});
        resolve();
    });
}

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

function initiateMatchSettings1vs1(cmdHandler){
    let pro = new Promise((resolve, reject) => {
        cmdHandler.fight.setFightType("tagteam");
        resolve();
    }).then(() => {
        cmdHandler.join("Red", {character: "Aelith Blanchette", channel: "here"});
    }).then(() => {
        cmdHandler.join("Blue", {character: "TheTinaArmstrong", channel: "here"});
    }).then(() => {
        cmdHandler.ready("Blue", {character: "TheTinaArmstrong", channel: "here"});
    }).then(() => {
        cmdHandler.ready("Red", {character: "Aelith Blanchette", channel: "here"});
    });
}

function wasMessageSent(msg){
    return fChatLibInstance.sendMessage.calls.all().find(x => x.args[0].indexOf(msg) != -1) != undefined;
}











xdescribe("The database(s)", () => {

    function resetData(){
        return new Promise((resolve, reject) => {
            var subRequestFights = "SELECT flistplugins.nsfw_fights.idFight FROM flistplugins.nsfw_fights LEFT JOIN flistplugins.nsfw_fightfighters ON flistplugins.nsfw_fights.idFight = flistplugins.nsfw_fightfighters.idFight\
            WHERE idFighter IS NULL OR idFighter = 1 OR idFighter = 2 OR idFighter = 3 OR idFighter = 4";
            var sqlResetFightsActions = "DELETE FROM flistplugins.nsfw_actions where idFight IN ("+subRequestFights+") OR idAttacker = 1 OR idAttacker = 2 OR idAttacker = 3 OR idAttacker = 4 OR idDefender = 1 OR idDefender = 2 OR idDefender = 3 OR idDefender = 4";
            var sqlResetFightFighters = "DELETE FROM flistplugins.nsfw_fightfighters where idFight IN ("+subRequestFights+") OR idFighter = 1 OR idFighter = 2 OR idFighter = 3 OR idFighter = 4;";
            var sqlResetFights = "DELETE flistplugins.nsfw_fights.* FROM flistplugins.nsfw_fights \
            WHERE idFight IN ("+subRequestFights+") idFighter IS NULL OR idFighter = 1 OR idFighter = 2 OR idFighter = 3 OR idFighter = 4;"; //clear all fights linked to the 4 fighters
            var sqlResetTestFighters = "DELETE FROM flistplugins.nsfw_fighters where name = 'test' OR name = 'test2' OR name = 'test3' OR name = 'test4';";
            var sqlAddTestFighter1 = "INSERT INTO flistplugins.nsfw_fighters VALUES ('1', 'test', '0', '0', '0', '0', '0', '0', '0.00', '1', '1', '1', '1', '1', '1', '1', '0');";
            var sqlAddTestFighter2 = "INSERT INTO flistplugins.nsfw_fighters VALUES ('2', 'test2', '0', '0', '0', '0', '0', '0', '0.00', '1', '1', '1', '1', '1', '1', '1', '0');";
            var sqlAddTestFighter3 = "INSERT INTO flistplugins.nsfw_fighters VALUES ('3', 'test3', '0', '0', '0', '0', '0', '0', '0.00', '1', '1', '1', '1', '1', '1', '1', '0');";
            var sqlAddTestFighter4 = "INSERT INTO flistplugins.nsfw_fighters VALUES ('4', 'test4', '0', '0', '0', '0', '0', '0', '0.00', '1', '1', '1', '1', '1', '1', '1', '0');";
            var addFight = "INSERT INTO `flistplugins`.`nsfw_fights` (`idFight`, `idFightType`,  `idStage`, `usedTeams`, `currentTurn`, `fighterList`, `hasEnded`) VALUES (1,1, 1,2, 2, '', 0);";
            Data.db.query(sqlResetFightsActions, (err, result) => {
                Data.db.query(sqlResetFightFighters, (err, result) => {
                    Data.db.query(sqlResetFights, (err, result) => {
                        Data.db.query(sqlResetTestFighters, (err, result) => {
                            Data.db.query(sqlAddTestFighter1, (err, result) => {
                                Data.db.query(sqlAddTestFighter2, (err, result) => {
                                    Data.db.query(sqlAddTestFighter3, (err, result) => {
                                        Data.db.query(sqlAddTestFighter4, (err, result) => {
                                            Data.db.query(addFight, (err, result) => {
                                                resolve();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
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
            }
        };

        spyOn(fChatLibInstance, 'sendMessage').and.callThrough();
        spyOn(fChatLibInstance, 'throwError').and.callThrough();
        spyOn(fChatLibInstance, 'sendPrivMessage').and.callThrough();
    });

    xit("should say Test is already there", function (done) {
        Fighter.exists("Test").then(x => {
            if(x.name == "Test"){
                done();
            }
            else{
                done(new Error("Test wasn't found in the database."));
            }
        }).catch(err => {
            done.fail(err);
        });
    },5000);

    xit("should say Test2 is already there", function (done) {
        Fighter.exists("Test2").then(x => {
            if(x.name == "Test2"){
                done();
            }
            else{
                done(new Error("Test2 wasn't found in the database."));
            }
        }).catch(err => {
            done.fail(err);
        });
    },5000);

    xit("should say Test2 is already there", function (done) {
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
        Fighter.exists("Test2").then(x => {
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
        Fighter.exists("Test2").then(x => {
            let myAction = new FightAction(1, 1, 1, Action.Brawl, x);
            FightAction.commitDb(myAction).then(id => {
                expect(id).toBeGreaterThan(0);
                done();
            }).catch(err => {
                done.fail(err);
            });
        });
    },5000);

    xit("should write a new fight in the database", function (done) {
        Fighter.exists("Test2").then(x => {
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
        waitUntil().interval(2).times(5000).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "test") != -1; }).done(() =>{
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


/// <reference path="../typings/jasmine/jasmine.d.ts">
describe("The player(s)", () => {


    beforeEach(function() {
        abstractDatabase();
        fChatLibInstance = {
            sendMessage: function(message:string, channel:string){
                if(debug){
                    console.log("Sent MESSAGE "+message + " on channel "+channel);
                }
            },
            throwError: function(s: string){
                if(debug) {
                    console.log("Sent ERROR " + s);
                }
            },
            sendPrivMessage: function(character: string, message: string){
                if(debug) {
                    console.log("Sent PRIVMESSAGE " + message + " to " + character);
                }
            }
        };

        usedIndexes = [];
        usedFighters = [];

        spyOn(fChatLibInstance, 'sendMessage').and.callThrough();
        spyOn(fChatLibInstance, 'throwError').and.callThrough();
        spyOn(fChatLibInstance, 'sendPrivMessage').and.callThrough();
        spyOn(Fighter, 'exists').and.callThrough();
    });

    xit("should be initialized to 3-3-3-3-3-3 name = Yolo", function(){
        let fighterYolo = createFighter("Yolo");
        expect(fighterYolo.name).toBe("Yolo");
    });

    xit("should be initialized 3-3-3-3-3-3 stats with two different names", function(){
        let fighterYolo = createFighter("Yolo");
        let fighterLoyo = createFighter("Loyo");
        expect(fighterYolo.name+fighterLoyo.name).toBe("YoloLoyo");
    });


    xit("should join the match", function(done){
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.join("", data);
        setTimeout(() => {
            if(expect(fChatLibInstance.sendMessage).toHaveBeenCalledWith('[color=red]Aelith Blanchette stepped into the ring for the [color=Blue]Blue[/color] team! Waiting for everyone to be !ready.[/color]', 'here')){
                done();
            }
            else{
                done(new Error("The player couldn't join the match"));
            }
        }, 300);
    });

    xit("should have been checking if fighter exists", function(){
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.join("", data);
        expect(Fighter.exists).toHaveBeenCalled();
    });

    xit("should not be joining a match twice", function(done){
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.join("", data);
        x.join("", data);
        setTimeout(() => {
            if(expect(fChatLibInstance.sendMessage).toHaveBeenCalledWith('[color=red]You have already joined the fight.[/color]', 'here')){
                done();
            }
            else{
                done(new Error("The player couldn't join the match"));
            }
        }, 300);
    });


    xit("should join the match and set as ready", function(done){
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.ready("", data);
        setTimeout(() => {
            if(expect(fChatLibInstance.sendMessage).toHaveBeenCalledWith('[color=red]Aelith Blanchette is now ready to get it on![/color]\n', 'here')){
                done();
            }
            else{
                done(new Error("Did not put the player as ready"));
            }
        }, 300);
    });

    xit("should have already joined the ring and already set ready", function(done){
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.ready("", data);
        x.ready("", data);
        setTimeout(() => {
            if(expect(fChatLibInstance.sendMessage).toHaveBeenCalledWith('[color=red]You are already ready.[/color]', 'here')){
                done();
            }
            else{
                done(new Error("Did not successfully check if the fighter was already ready"));
            }
        }, 300);
    });

    xit("should be ready to start with the default blue and red team", function(done){
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.join("", data);
        var data:FChatResponse = {character: "TheTinaArmstrong", channel: "here"};
        x.join("", data);
        setTimeout(() => {
            if(expect(fChatLibInstance.sendMessage).toHaveBeenCalledWith('[color=red]Aelith Blanchette stepped into the ring for the [color=Blue]Blue[/color] team! Waiting for everyone to be !ready.[/color]', 'here')
            && expect(fChatLibInstance.sendMessage).toHaveBeenCalledWith('[color=red]TheTinaArmstrong stepped into the ring for the [color=Red]Red[/color] team! Waiting for everyone to be !ready.[/color]', 'here')
            && x.fight.hasStarted == false){
                done();
            }
            else{
                done(new Error("Did not put the player as ready"));
            }
        }, 300);
    });

    xit("should tag successfully with Aelith", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings2vs2Tag(cmd);
        waitUntil().interval(2).times(5000).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                cmd.tag("Aelith Blanchette", {character: "TheTinaArmstrong", channel: "here"});
                waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.currentPlayer != undefined && cmd.fight.currentPlayer.name != "Aelith Blanchette");}).done(() =>{
                    done();
                });
            });
        });
    },8000);


    xit("should swap to TheTinaArmstrong", function(done) {
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction)}).done(() =>{
            let fighterNameBefore = cmd.fight.currentPlayer.name;
            cmd.fight.assignRandomTarget(cmd.fight.currentPlayer)
            cmd.fight.setCurrentPlayer(cmd.fight.currentTarget.name);
            if(cmd.fight.currentPlayer.name != fighterNameBefore){
                done();
            }
            else{
                done(new Error("Fighters didn't swap places."));
            }
        });
    });

    xit("should do a brawl move", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "brawl", "Light").then(() => {
                if(wasHealthHxit(cmd, "Aelith Blanchette")) {
                    done();
                }
                else{
                    done(new Error("HPs were not drained despite the fact that the attack should have hit."));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should do a sexstrike move", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            doAction(cmd, "sex", "Light").then(() => {
                if(wasLustHxit(cmd, "Aelith Blanchette")) {
                    done();
                }
                else{
                    done(new Error("HPs were not drained despite the fact that the attack had hit."));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should pass", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            let fighterNameBefore = cmd.fight.currentPlayer.name;
            doAction(cmd, "pass", "Light").then(() => {
                if(cmd.fight.currentPlayer.name != fighterNameBefore) {
                    done();
                }
                else{
                    done(new Error("HPs were not drained despite the fact that the attack had hit."));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should do a subhold and tick", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                if(wasHealthHxit(cmd, "Aelith Blanchette") && cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.findIndex(x => x.name == Constants.Modifier.SubHold) != -1){
                    done();
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should do a subhold and expire after two turns", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                cmd.fight.nextTurn();
                cmd.fight.nextTurn();
                if(wasHealthHxit(cmd, "Aelith Blanchette") && cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.length == 0){
                    done();
                }
                else{
                    done(new Error("Did not correctly expire the modifiers, or the health wasn't hit."));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should do a subhold and trigger bonus brawl modifier", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                doAction(cmd, "brawl", "Light").then(() => {
                    if (wasMessageSent("[b][color=Red]Aelith Blanchette[/color][/b] is still affected by the bonus on accuracy during a submission hold!\n")) {
                        done();
                    }
                    else{
                        done(new Error("Did not say that the attacker has an accuracy bonus."));
                    }
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should not be allowed to do a subhold while already in one", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                doAction(cmd, "subhold", "Light").then(() => {
                    if (wasMessageSent("[b][color=red]You cannot do that since you're in a hold.[/color][/b]\n")) {
                        done();
                    }
                    else{
                        done(new Error("Did not say that the attacker is locked in a hold."));
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should be allowed to do a second subhold while already APPLYING one", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "subhold", "Light").then(() => {
                    if (!wasMessageSent("[b][color=red]You cannot do that since you're in a hold.[/color][/b]\n")) {
                        done();
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should stack the current subhold with another subhold, verify stacking", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "subhold", "Light").then(() => {
                    if (wasMessageSent("[b][color=red]Hold Stacking![/color][/b]")) {
                        done();
                    }
                    else{
                        done(new Error("The number of uses after a hold stacking hasn't been increased correctly."))
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should stack the current subhold with another subhold, verify uses", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                let indexOfSubHoldModifier = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.findIndex(x => x.name == Constants.Modifier.SubHold);
                if(indexOfSubHoldModifier == -1){
                    done(new Error("Did not find the correct subhold modifier in the defender's list."));
                }
                let usesLeftBefore = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers[indexOfSubHoldModifier].uses;
                cmd.fight.nextTurn();
                //CAREFUL! Sometimes the damage is way too high, so it breaks one heart per tick. So we reset the hearts.
                cmd.fight.fighterList.getFighterByName("Aelith Blanchette").heartsRemaining = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").maxHearts();
                doAction(cmd, "subhold", "Light").then(() => {
                    let usesLeftAfter = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers[indexOfSubHoldModifier].uses;
                    if (usesLeftAfter > usesLeftBefore) {
                        done();
                    }
                    else{
                        done(new Error("The number of uses after a hold stacking hasn't been increased correctly."))
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },100000000);

    xit("should do a sexhold and tick", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sexhold", "Light").then(() => {
                if(wasLustHxit(cmd, "Aelith Blanchette") && cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.findIndex(x => x.name == Constants.Modifier.SexHold) != -1){
                    done();
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should not be able to do a humhold without a sexhold", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "humhold", "Light").then(() => {
                if(wasMessageSent("[b][color=red]You cannot do that since your target is not in a sexual hold.[/color][/b]")){
                    done();
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should be able to do a humhold with sexhold", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sexhold", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "humhold", "Light").then(() => {
                    if(wasMessageSent("the HumHold attack [b][color=green]HITS![/color][/b]")){
                        done();
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should be making the humhold tick", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sexhold", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "humhold", "Light").then(() => {
                    if(wasMessageSent("Aelith Blanchette [color=red]lost 2 Focus![/color]")){
                        done();
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    it("should be dealing more focus damage with humiliation ", function(done){
        debug = true;
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "degradation", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "sexhold", "Light").then(() => {
                    cmd.fight.nextTurn();
                    doAction(cmd, "humhold", "Light").then(() => {
                        if (wasMessageSent("is still affected by the degradation malus!")) {
                            done();
                        }
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },10000);


    xit("should pickup an item and trigger bonus brawl modifier", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "itempickup", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "brawl", "Light").then(() => {
                    if (wasMessageSent(`[b][color=Blue]TheTinaArmstrong[/color][/b] is still affected by the ${Constants.Modifier.ItemPickupBonus}!\n`)) {
                        done();
                    }
                    else{
                        done(new Error("Did not say that the attacker has an item pickup bonus."));
                    }
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should pickup a sextoy and trigger bonus sexstrike modifier", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sextoypickup", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "sex", "Light").then(() => {
                    if (wasMessageSent(`[b][color=Blue]TheTinaArmstrong[/color][/b] is still affected by the ${Constants.Modifier.SextoyPickupBonus}!\n`)) {
                        done();
                    }
                    else{
                        done(new Error("Did not say that the attacker has an item pickup bonus."));
                    }
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    xit("should win the match with 3 bondage attacks", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sexhold", "Light").then(() => {
                cmd.fight.nextTurn();
                cmd.fight.fighterList.getFighterByName("Aelith Blanchette").orgasmsRemaining = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").maxOrgasms(); //to prevent ending the fight this way
                doAction(cmd, "bondage", "Light").then(() => {
                    cmd.fight.nextTurn();
                    cmd.fight.fighterList.getFighterByName("Aelith Blanchette").orgasmsRemaining = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").maxOrgasms();
                    doAction(cmd, "sexhold", "Light").then(() => {
                        cmd.fight.nextTurn();
                        cmd.fight.fighterList.getFighterByName("Aelith Blanchette").orgasmsRemaining = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").maxOrgasms();
                        doAction(cmd, "bondage", "Light").then(() => {
                            cmd.fight.nextTurn();
                            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").orgasmsRemaining = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").maxOrgasms();
                            doAction(cmd, "bondage", "Light").then(() => {
                                if (wasMessageSent(`Aelith Blanchette has too many items on them to possibly fight! [b][color=red]They're out![/color][/b]`)) {
                                    done();
                                }
                                else{
                                    done(new Error("Did not say that the attacker has an item pickup bonus."));
                                }
                            }).catch(err => {
                                fChatLibInstance.throwError(err);
                            });
                        }).catch(err => {
                            fChatLibInstance.throwError(err);
                        });
                    }).catch(err => {
                        fChatLibInstance.throwError(err);
                    });
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },150000);

    xit("should say you can't place a bondage attack without a sexhold", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
                doAction(cmd, "bondage", "Light").then(() => {
                    if (wasMessageSent(`[b][color=red]You cannot do that since your target is not in a sexual hold.[/color][/b]`)) {
                        done();
                    }
                    else{
                        done(new Error("Did not say that the attacker must apply a sexhold for a bondage attack."));
                    }
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
        });
    });

    xit("should forfeit the match and give the win", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            doAction(cmd, "forfeit", "").then(() => {
                if (wasMessageSent("has too many items on them to possibly fight!")) {
                    done();
                }
                else{
                    done(new Error("Did not say that the attacker must apply a sexhold for a bondage attack."));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },500000);

    xit("should call the match a draw", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            doAction(cmd, "draw", "").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "draw", "").then(() => {
                    if (wasMessageSent("Everybody agrees, it's a draw!")) {
                        done();
                    }
                    else{
                        done(new Error("Did not say that the attacker must apply a sexhold for a bondage attack."));
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },500000);

});

jasmine.execute();