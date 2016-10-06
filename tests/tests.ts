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
import {Promise} from "es6-promise";
import {StunModifier} from "../plugins/NSFWClasses/CustomModifiers";
import {EnumEx} from "../plugins/NSFWClasses/Utils";
import Trigger = Constants.Trigger;
var waitUntil = require('wait-until');
var Jasmine = require('jasmine');
var jasmine = new Jasmine();
var fChatLibInstance: any;
var debug = false;
var mockedClasses = [];
var usedIndexes = [];
var usedFighters = [];

const DEFAULT_TIMEOUT = 15000;

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
    if(Utils.findIndex(usedFighters,"name",name) == -1){
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
        myFighter = usedFighters[Utils.findIndex(usedFighters,"name",name)];
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


function wasHealthHit(cmd:CommandHandler, name:string){
    return (
        (
            cmd.fight.fighterList.getFighterByName(name).hp == cmd.fight.fighterList.getFighterByName(name).hpPerHeart() &&
            cmd.fight.fighterList.getFighterByName(name).heartsRemaining < cmd.fight.fighterList.getFighterByName(name).maxHearts()
        )
        ||
        cmd.fight.fighterList.getFighterByName(name).hp < cmd.fight.fighterList.getFighterByName(name).hpPerHeart()
    );
}

function wasLustHit(cmd:CommandHandler, name:string){
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

function refillHPLPFP(cmd, name){
    cmd.fight.fighterList.getFighterByName(name).orgasmsRemaining = cmd.fight.fighterList.getFighterByName(name).maxOrgasms(); //to prevent ending the fight this way
    cmd.fight.fighterList.getFighterByName(name).heartsRemaining = cmd.fight.fighterList.getFighterByName(name).maxHearts();
    cmd.fight.fighterList.getFighterByName(name).consecutiveTurnsWithoutFocus = 0; //to prevent ending the fight this way
    cmd.fight.fighterList.getFighterByName(name).focus = cmd.fight.fighterList.getFighterByName(name).maxFocus();
}











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

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    },DEFAULT_TIMEOUT);

  it("should do a tackle and grant the stun modifier", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "tackle", "Light").then(() => {
                let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                waitUntil().interval(100).times(50).condition(condition).done(() => {
                    if (cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.length > 0 &&
                        cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers[0] instanceof StunModifier) {
                        done();
                    }
                    else {
                        done.fail(new Error("Didn't do the tackle"));
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should do a tackle and grant the stun modifier, and reduce the dice roll", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "tackle", "Light").then(() => {
                doAction(cmd, "brawl", "Light").then(() => {
                    let condition = () => {
                        return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);
                    };
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.length == 0 && wasMessageSent("penalty applied on their dice roll")) {
                            done();
                        }
                        else {
                            done.fail(new Error("Didn't do the tackle"));
                        }
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should do a forcedworship attack", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "forcedworship", "Light").then(() => {
                let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                waitUntil().interval(100).times(50).condition(condition).done(() => {
                    if (wasMessageSent("the ForcedWorship attack [b][color=green]HITS![/color][/b]")) {
                        done();
                    }
                    else {
                        done.fail(new Error("Didn't tick sexhold"));
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should heal 0 hp because it's already full", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").healHP(10);
            cmd.fight.sendMessage();
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                if(!wasMessageSent("gained 0 HP")){
                    done();
                }
                else{
                    done.fail(new Error("Either heal was not triggered or was different than 0HP"));
                }
            });
        });
    },DEFAULT_TIMEOUT);

  it("should heal whatever hp amount is left", function(done){ // 0
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            var initialHp = 10;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").hp = initialHp;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").healHP(50);
            cmd.fight.sendMessage();
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                if(wasMessageSent(`gained ${cmd.fight.fighterList.getFighterByName("Aelith Blanchette").hpPerHeart() - initialHp} HP`)){
                    done();
                }
                else{
                    done.fail(new Error("Either heal was not triggered or was different than the required HP"));
                }
            });
        });
    },DEFAULT_TIMEOUT);

  it("should heal 1 HP", function(done){ // 0
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            var initialHp = 1;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").hp = initialHp;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").healHP(1);
            cmd.fight.sendMessage();
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                if(wasMessageSent(`gained 1 HP`)){
                    done();
                }
                else{
                    done.fail(new Error("Either heal was not triggered or was different than 1HP"));
                }
            });
        });
    },DEFAULT_TIMEOUT);

  it("should heal 0 lp because it's already full", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").healLP(10);
            cmd.fight.sendMessage();
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                if(!wasMessageSent("was removed 0 LP")){
                    done();
                }
                else{
                    done.fail(new Error("Either heal was not triggered or was different than 0HP"));
                }
            });
        });
    },DEFAULT_TIMEOUT);

  it("should heal whatever lp amount is left", function(done){ // 0
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            var initialHp = 2;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").lust = initialHp;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").healLP(50);
            cmd.fight.sendMessage();
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                if(wasMessageSent(`was removed ${initialHp} LP`)){
                    done();
                }
                else{
                    done.fail(new Error("Either heal was not triggered or was different than the required LP"));
                }
            });
        });
    },DEFAULT_TIMEOUT);

  it("should heal 1 LP", function(done){ // 0
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            var initialHp = 1;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").lust = 1;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").healLP(1);
            cmd.fight.sendMessage();
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                if(wasMessageSent(`was removed 1 LP`)){
                    done();
                }
                else{
                    done.fail(new Error("Either lustheal was not triggered or was different than 1LP"));
                }
            });
        });
    },DEFAULT_TIMEOUT);

  it("should heal 0 fp because it's already full", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            refillHPLPFP(cmd, "Aelith Blanchette");
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").healFP(10);
            cmd.fight.sendMessage();
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                if(!wasMessageSent("gained 0 FP")){
                    done();
                }
                else{
                    done.fail(new Error("Either heal was not triggered or was different than 0FP"));
                }
            });
        });
    },DEFAULT_TIMEOUT);

  it("should heal whatever fp amount is left", function(done){ // 0
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            var initialHp = 1;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").focus = initialHp;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").healFP(50);
            cmd.fight.sendMessage();
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                if(wasMessageSent(`gained ${cmd.fight.fighterList.getFighterByName("Aelith Blanchette").maxFocus() - initialHp} FP`)){
                    done();
                }
                else{
                    done.fail(new Error("Either heal was not triggered or was different than the required FP"));
                }
            });
        });
    },DEFAULT_TIMEOUT);

  it("should heal 1 FP", function(done){ // 0
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            var initialHp = 1;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").focus = initialHp;
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").healFP(1);
            cmd.fight.sendMessage();
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                if(wasMessageSent(`gained 1 FP`)){
                    done();
                }
                else{
                    done.fail(new Error("Either heal was not triggered or was different than 1FP"));
                }
            });
        });
    },DEFAULT_TIMEOUT);

  it("should be initialized to 3-3-3-3-3-3 name = Yolo", function(){ //1
        let fighterYolo = createFighter("Yolo");
        expect(fighterYolo.name).toBe("Yolo");
    },DEFAULT_TIMEOUT);

  it("should be initialized 3-3-3-3-3-3 stats with two different names", function(){ //2
        let fighterYolo = createFighter("Yolo");
        let fighterLoyo = createFighter("Loyo");
        expect(fighterYolo.name+fighterLoyo.name).toBe("YoloLoyo");
    },DEFAULT_TIMEOUT);


  it("should join the match", function(done){ //3
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.join("", data);
        setTimeout(() => {
            if(wasMessageSent("stepped into the ring for the")){
                done();
            }
            else{
                done.fail(new Error("The player couldn't join the match"));
            }
        }, 300);
    },DEFAULT_TIMEOUT);

  it("should have been checking if fighter exists", function(){ //4
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.join("", data);
        expect(Fighter.exists).toHaveBeenCalled();
    },DEFAULT_TIMEOUT);

  it("should not be joining a match twice", function(done){ //5
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.join("", data);
        x.join("", data);
        setTimeout(() => {
            if(wasMessageSent('You have already joined the fight')){
                done();
            }
            else{
                done.fail(new Error("The player couldn't join the match"));
            }
        }, 300);
    },DEFAULT_TIMEOUT);


  it("should join the match and set as ready", function(done){ //6
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.ready("", data);
        setTimeout(() => {
            if(wasMessageSent("is now ready to get it on!")){
                done();
            }
            else{
                done.fail(new Error("Did not put the player as ready"));
            }
        }, 300);
    },DEFAULT_TIMEOUT);

  it("should have already joined the ring and already set ready", function(done){ //7
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.ready("", data);
        x.ready("", data);
        setTimeout(() => {
            if(wasMessageSent("You are already ready.[/color]")){
                done();
            }
            else{
                done.fail(new Error("Did not successfully check if the fighter was already ready"));
            }
        }, 300);
    },DEFAULT_TIMEOUT);

  it("should be ready to start with the default blue and red team", function(done){ //8
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.join("", data);
        var data:FChatResponse = {character: "TheTinaArmstrong", channel: "here"};
        x.join("", data);
        setTimeout(() => {
            if(wasMessageSent("stepped into the ring for the [color=Blue]Blue[/color] team! Waiting for everyone to be !ready.")
            && wasMessageSent("stepped into the ring for the [color=Red]Red[/color] team! Waiting for everyone to be !ready.")
            && x.fight.hasStarted == false){
                done();
            }
            else{
                done.fail(new Error("Did not put the player as ready"));
            }
        }, 300);
    },DEFAULT_TIMEOUT);

  it("should tag successfully with Aelith", function(done){ // 9
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings2vs2Tag(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                cmd.tag("", {character: "TheTinaArmstrong", channel: "here"});
                doAction(cmd, "tag", "Aelith Blanchette").then(() => {
                    waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.fighterList.getFighterByName("Aelith Blanchette").isInTheRing);}).done((res) =>{
                        if(res){
                            done();
                        }
                        else{
                            done.fail(new Error("Did not tag with Aelith"));
                        }
                    });
                });
            });
        });
    },DEFAULT_TIMEOUT);


  it("should swap to TheTinaArmstrong", function(done) {
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
                done.fail(new Error("Fighters didn't swap places."));
            }
        });
    },DEFAULT_TIMEOUT);

  it("should do a brawl move", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "brawl", "Light").then(() => {
                if(wasHealthHit(cmd, "Aelith Blanchette")) {
                    done();
                }
                else{
                    done.fail(new Error("HPs were not drained despite the fact that the attack should have hit."));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should do a sexstrike move", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            doAction(cmd, "sex", "Light").then(() => {
                if(wasLustHit(cmd, "Aelith Blanchette")) {
                    done();
                }
                else{
                    done.fail(new Error("Did not do a sextrike move, or the damage wasn't done"));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should pass", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            let fighterNameBefore = cmd.fight.currentPlayer.name;
            doAction(cmd, "rest", "").then(() => {
                if(cmd.fight.currentPlayer.name != fighterNameBefore) {
                    done();
                }
                else{
                    done.fail(new Error("Did not pass turn correctly"));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it(`should give a loss after ${Constants.maxTurnsWithoutFocus} turns without focus`, function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.fighterList.getFighterByName("Aelith Blanchette").focus = -100;
            for(var i = 0; i < Constants.maxTurnsWithoutFocus; i++){
                cmd.fight.nextTurn();
            }
            if(cmd.fight.fighterList.getFighterByName("Aelith Blanchette").isBroken()){
                done();
            }
            else{
                done.fail(new Error(`Player was still alive after ${Constants.maxTurnsWithoutFocus} turns without focus`));
            }
        });
    },DEFAULT_TIMEOUT);

 it("should do a subhold and tick", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.hasStarted; }).done(() =>{
            waitUntil().interval(100).times(50).condition(() => {return cmd.fight.waitingForAction}).done(() => {
                cmd.fight.setCurrentPlayer("TheTinaArmstrong");
                doAction(cmd, "subhold", "Light").then(() => {
                    if (wasHealthHit(cmd, "Aelith Blanchette") && cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.findIndex(x => x.name == Constants.Modifier.SubHold) != -1) {
                        done();
                    }
                    else {
                        done.fail(new Error("Didn't tick subhold"));
                    }
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
            });
        });
    },DEFAULT_TIMEOUT);

  it("should do a subhold and expire after the number of turns specified", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(10).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                for(var i = 0; i < Constants.initialNumberOfTurnsForHold; i++){
                    cmd.fight.nextTurn();
                    refillHPLPFP(cmd, "Aelith Blanchette");
                }
                if(cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.length == 0){
                    done();
                }
                else{
                    done.fail(new Error("Did not correctly expire the sexhold modifiers."));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT+5000);

  it("should do a subhold and trigger bonus brawl modifier", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                doAction(cmd, "brawl", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (wasMessageSent(Constants.Modifier.SubHoldBrawlBonus)) {
                            done();
                        }
                        else {
                            done.fail(new Error("Did not say that the attacker has an accuracy bonus."));
                        }
                    });
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should not be allowed to do a subhold while already in one", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                doAction(cmd, "subhold", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (wasMessageSent("[b][color=red]You cannot do that since you're in a hold.[/color][/b]\n")) {
                            done();
                        }
                        else {
                            done.fail(new Error("Did not say that the attacker is locked in a hold."));
                        }
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should be allowed to do a second subhold while already APPLYING one", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "subhold", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (!wasMessageSent("[b][color=red]You cannot do that since you're in a hold.[/color][/b]\n")) {
                            done();
                        }
                        else {
                            done.fail(new Error("Didn't stack the two subholds correctly"));
                        }
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should stack the current subhold with another subhold, verify stacking", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "subhold", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (wasMessageSent("Hold Stacking!")) {
                            done();
                        }
                        else {
                            done.fail(new Error("The number of uses after a hold stacking hasn't been increased correctly."))
                        }
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should stack the current subhold with another subhold, verify uses", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "subhold", "Light").then(() => {
                let indexOfSubHoldModifier = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.findIndex(x => x.name == Constants.Modifier.SubHold);
                if(indexOfSubHoldModifier == -1){
                    done.fail(new Error("Did not find the correct subhold modifier in the defender's list."));
                }
                let usesLeftBefore = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers[indexOfSubHoldModifier].uses;
                cmd.fight.nextTurn();
                refillHPLPFP(cmd, "Aelith Blanchette");
                doAction(cmd, "subhold", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        let usesLeftAfter = 0;
                        if(cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers[indexOfSubHoldModifier]){
                            usesLeftAfter = cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers[indexOfSubHoldModifier].uses;
                        }
                        if (usesLeftAfter > usesLeftBefore) {
                            done();
                        }
                        else {
                            done.fail(new Error("The number of uses after a hold stacking hasn't been increased correctly."))
                        }
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should do a sexhold and tick", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sexhold", "Light").then(() => {
                let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                waitUntil().interval(100).times(50).condition(condition).done(() => {
                    if (wasLustHit(cmd, "Aelith Blanchette") && cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.findIndex(x => x.name == Constants.Modifier.SexHold) != -1) {
                        done();
                    }
                    else {
                        done.fail(new Error("Didn't tick sexhold"));
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should not be able to do a humhold without a sexhold", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "humhold", "Light").then(() => {
                let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                waitUntil().interval(100).times(50).condition(condition).done(() => {
                    if (wasMessageSent("[b][color=red]You cannot do that since your target is not in a sexual hold.[/color][/b]")) {
                        done();
                    }
                    else {
                        done.fail(new Error("Still did a humiliation hold without a sexhold"));
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should be able to do a humhold with sexhold", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sexhold", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "humhold", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (wasMessageSent("the HumHold attack [b][color=green]HITS![/color][/b]")) {
                            done();
                        }
                        else {
                            done.fail(new Error("Didn't get to do a humiliation hold after a sexhold"));
                        }
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    }, DEFAULT_TIMEOUT);

  it("should be making the humhold tick", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sexhold", "Light").then(() => {
                cmd.fight.nextTurn();
                refillHPLPFP(cmd, "Aelith Blanchette");
                doAction(cmd, "humhold", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if(cmd.fight.fighterList.getFighterByName("Aelith Blanchette").modifiers.findIndex(x => x.name == Constants.Modifier.HumHold) != -1){
                            done();
                        }
                        else{
                            done.fail(new Error("Didn't give humiliation hold modifier"));
                        }
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should be dealing more focus damage with humiliation ", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "degradation", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "sexhold", "Light").then(() => {
                    cmd.fight.nextTurn();
                    doAction(cmd, "humhold", "Light").then(() => {
                        let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                        waitUntil().interval(100).times(50).condition(condition).done(() => {
                            if (wasMessageSent("is still affected by the degradation malus!")) {
                                done();
                            }
                            else {
                                done.fail(new Error("Didn't deal more damage with degradation malus"));
                            }
                        });
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);


  it("should pickup an item and trigger bonus brawl modifier", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "itempickup", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "brawl", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (wasMessageSent(Constants.Modifier.ItemPickupBonus)) {
                            done();
                        }
                        else {
                            done.fail(new Error("Did not say that the attacker has an item pickup bonus."));
                        }
                    });
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should pickup a sextoy and trigger bonus sexstrike modifier", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sextoypickup", "Light").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "sex", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (cmd.fight.fighterList.getFighterByName("TheTinaArmstrong").modifiers.findIndex((x) => x.type == Constants.ModifierType.SextoyPickupBonus) != -1) {
                            done();
                        }
                        else {
                            done.fail(new Error("Did not have the sextoy item pickup bonus modifier."));
                        }
                    });
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

 it("should win the match with 3 bondage attacks", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(100).times(50).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
            doAction(cmd, "sexhold", "Light").then(() => {
                cmd.fight.nextTurn();
                refillHPLPFP(cmd, "Aelith Blanchette");
                doAction(cmd, "bondage", "Light").then(() => {
                    cmd.fight.nextTurn();
                    refillHPLPFP(cmd, "Aelith Blanchette");
                    doAction(cmd, "sexhold", "Light").then(() => {
                        cmd.fight.nextTurn();
                        refillHPLPFP(cmd, "Aelith Blanchette");
                        doAction(cmd, "bondage", "Light").then(() => {
                            cmd.fight.nextTurn();
                            refillHPLPFP(cmd, "Aelith Blanchette");
                            doAction(cmd, "bondage", "Light").then(() => {
                                refillHPLPFP(cmd, "Aelith Blanchette");
                                let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                                waitUntil().interval(100).times(50).condition(condition).done(() => {
                                    if (wasMessageSent(`has too many items on them to possibly fight`)) {
                                        done();
                                    }
                                    else {
                                        done.fail(new Error("Did not say that the receiver must abandon because of bondage."));
                                    }
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
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT+10000);

  it("should say you can't place a bondage attack without a sexhold", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.setCurrentPlayer("TheTinaArmstrong");
                doAction(cmd, "bondage", "Light").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (wasMessageSent(`[b][color=red]You cannot do that since your target is not in a sexual hold.[/color][/b]`)) {
                            done();
                        }
                        else {
                            done.fail(new Error("Did not say that the attacker must apply a sexhold for a bondage attack."));
                        }
                    });
                }).catch(err => {
                    fChatLibInstance.throwError(err);
                });
        });
    },DEFAULT_TIMEOUT);

  it("should forfeit the match and give the win", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            doAction(cmd, "forfeit", "").then(() => {
                let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                waitUntil().interval(100).times(50).condition(condition).done(() => {
                    if (wasMessageSent("has too many items on them to possibly fight!")) {
                        done();
                    }
                    else {
                        done.fail(new Error("Did not say that the attacker must apply a sexhold for a bondage attack."));
                    }
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

  it("should call the match a draw", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            doAction(cmd, "draw", "").then(() => {
                cmd.fight.nextTurn();
                doAction(cmd, "draw", "").then(() => {
                    let condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
                    waitUntil().interval(100).times(50).condition(condition).done(() => {
                        if (wasMessageSent("Everybody agrees, it's a draw!")) {
                            done();
                        }
                        else {
                            done.fail(new Error("Did not say that the attacker must apply a sexhold for a bondage attack."));
                        }
                    });
                });
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    },DEFAULT_TIMEOUT);

});

jasmine.execute();