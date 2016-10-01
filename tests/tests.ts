import {Fighter} from "../plugins/NSFWClasses/Fighter";
import {Fight} from "../plugins/NSFWClasses/Fight";
import {IFChatLib} from "../plugins/NSFWClasses/interfaces/IFChatLib";
import {CommandHandler} from "../plugins/NSFWClasses/CommandHandler";
import {Constants} from "../plugins/NSFWClasses/Constants";
import Tier = Constants.Tier;
import {Utils} from "../plugins/NSFWClasses/Utils";
import {FightAction} from "../plugins/NSFWClasses/FightAction";
var waitUntil = require('wait-until');
//let myFighter = new Fighter("test", 0, 0 ,0 ,0 ,0);

var Jasmine = require('jasmine');
var jasmine = new Jasmine();

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

Fighter.exists = function(name){
    return new Promise(function(resolve, reject) {
        resolve(createFighter(name));
    });
};

FightAction.commitDb = function(action){
    action.id = Utils.getRandomInt(0,1000000);
};

Fight.commitEndFightDb = function(fight){
    return true;
};

Fight.saveState = function(fight){
    return true;
};

Fight.loadState = function(id, fight){
    fight.id = id;
    return true;
};

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
        myFighter.strength = myFighter.dexterity = myFighter.endurance = myFighter.toughness = myFighter.willpower = intStatsToAssign;
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
















/// <reference path="../typings/jasmine/jasmine.d.ts">
describe("The player(s)", () => {
    var fChatLibInstance: IFChatLib;
    var debug = false;

    beforeEach(function() {
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

    it("should be initialized to 3-3-3-3-3-3 name = Yolo", function(){
        let fighterYolo = createFighter("Yolo");
        expect(fighterYolo.name).toBe("Yolo");
    });

    it("should be initialized 3-3-3-3-3-3 stats with two different names", function(){
        let fighterYolo = createFighter("Yolo");
        let fighterLoyo = createFighter("Loyo");
        expect(fighterYolo.name+fighterLoyo.name).toBe("YoloLoyo");
    });


    it("should join the match", function(done){
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

    it("should have been checking if fighter exists", function(){
        var x = new CommandHandler(fChatLibInstance, "here");
        var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
        x.join("", data);
        expect(Fighter.exists).toHaveBeenCalled();
    });

    it("should not be joining a match twice", function(done){
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


    it("should join the match and set as ready", function(done){
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

    it("should have already joined the ring and already set ready", function(done){
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

    it("should be ready to start with the default blue and red team", function(done){
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

    it("should tag successfully with Aelith", function(done){
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
    },5000);


    it("should swap to TheTinaArmstrong", function(done) {
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction)}).done(() =>{
            let fighterNameBefore = cmd.fight.currentPlayer.name;
            console.log("Fighter before: "+fighterNameBefore);
            cmd.fight.assignRandomTarget(cmd.fight.currentPlayer)
            cmd.fight.setCurrentPlayer(cmd.fight.currentTarget.name);
            if(cmd.fight.currentPlayer.name != fighterNameBefore){
                console.log("Fighter after: "+cmd.fight.currentPlayer.name);
                done();
            }
            else{
                done(new Error("Fighters didn't swap places."));
            }
        });
    });

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
                    done(new Error("HPs were not drained despite the fact that the attack should have hit."));
                }
            }).catch(err => {
                fChatLibInstance.throwError(err);
            });
        });
    });

    it("should do a sexstrike move", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            doAction(cmd, "sex", "Light").then(() => {
                if(wasLustHit(cmd, "Aelith Blanchette")) {
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

    it("should pass", function(done){
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

    it("should do a subhold", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings1vs1(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            let fighterNameBefore = cmd.fight.currentPlayer.name;
            doAction(cmd, "subhold", "Light").then(() => {
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


});

jasmine.execute();

//console.log(myFighter.name);