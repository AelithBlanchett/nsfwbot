//import {Fighter} from "../plugins/NSFWClasses/Fighter";
//import {Fight} from "../plugins/NSFWClasses/Fight";
//import {IFChatLib} from "../plugins/NSFWClasses/interfaces/IFChatLib";
//import {CommandHandler} from "../plugins/NSFWClasses/CommandHandler";
//import * as Constants from "../plugins/NSFWClasses/Constants";
//import Tier = Constants.Tier;
//import {Utils} from "../plugins/NSFWClasses/Utils";
//import {FightAction} from "../plugins/NSFWClasses/FightAction";
//import Action = Constants.Action;
//import {Data} from "../plugins/NSFWClasses/Model";
//import {Promise} from "es6-promise";
//import Team = Constants.Team;
//import {EnumEx} from "../plugins/NSFWClasses/Utils";
//import Trigger = Constants.Trigger;
//var waitUntil = require('wait-until');
//var Jasmine = require('jasmine');
//var async = require('async');
//var stats = require('stats-lite');
//var jasmine = new Jasmine();
//var fChatLibInstance: any;
//var debug = false;
//var mockedClasses = [];
//var usedIndexes = [];
//var usedFighters = [];
//
//const DEFAULT_TIMEOUT = 15000;
//
//function getMock(mockedClass) {
//    if(mockedClasses.indexOf(mockedClass) != -1){
//        return new mockedClasses[mockedClasses.indexOf(mockedClass)]();
//    }
//    Object.getOwnPropertyNames(mockedClass.prototype).forEach(m => spyOn(mockedClass.prototype, m).and.callThrough());
//    mockedClasses.push(mockedClass);
//
//    return new mockedClass();
//}
//
////
////Abstraction of database layer
////
//
//function abstractDatabase(){
//
//    Fighter.exists = function(name){
//        return new Promise(function(resolve, reject) {
//            resolve(createFighter(name));
//        });
//    };
//
//    FightAction.commitDb = function(action){
//        return new Promise<number>(function(resolve, reject) {
//            action.id = Utils.getRandomInt(0,1000000);
//            resolve(action.id);
//        });
//    };
//
//    Fight.commitEndFightDb = function(fight){
//        return true;
//    };
//
//    Fight.saveState = function(fight){
//        return new Promise<number>(function(resolve, reject) {
//            resolve(Utils.getRandomInt(0,1000000));
//        });
//    };
//
//    Fight.loadState = function(id, fight){
//        fight.id = id;
//        return true;
//    };
//}
//
////Utilities
//
//function createFighter(name, intStatsToAssign:number = 3):Fighter{
//    let myFighter;
//    if(Utils.findIndex(usedFighters,"name",name) == -1){
//        myFighter = getMock(Fighter);
//        let randomId = -1;
//        do{
//            randomId = Utils.getRandomInt(0,1000000);
//        }while(usedIndexes.indexOf(randomId) != -1);
//        myFighter.id = randomId;
//        myFighter.name = name;
//        myFighter.power = myFighter.sensuality = myFighter.endurance = myFighter.toughness = myFighter.willpower = myFighter.dexterity = intStatsToAssign;
//        myFighter.hp = myFighter.hpPerHeart();
//        myFighter.heartsRemaining = myFighter.maxHearts();
//        myFighter.lust = 0;
//        myFighter.orgasmsRemaining = myFighter.maxOrgasms();
//        myFighter.focus = myFighter.willpower;
//        usedFighters.push(myFighter);
//    }
//    else{
//        myFighter = usedFighters[Utils.findIndex(usedFighters,"name",name)];
//    }
//
//    return myFighter;
//}
//
//function doAction(cmd:CommandHandler, action:string, target:string = "", condition?:any){
//    return new Promise((resolve, reject) => {
//        if(!condition){
//            condition = () => {return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction);};
//        }
//        waitUntil().interval(100).times(50).condition(condition).done(() => {
//            cmd.fight.currentPlayer.dice.addMod(50);
//            cmd[action](target, {character: cmd.fight.currentPlayer.name, channel: "here"});
//            waitUntil().interval(100).times(50).condition(condition).done(() => {
//                resolve();
//            });
//        });
//    });
//}
//
//
//function wasHealthHit(cmd:CommandHandler, name:string){
//    return (
//        (
//            cmd.fight.getFighterByName(name).hp == cmd.fight.getFighterByName(name).hpPerHeart() &&
//            cmd.fight.getFighterByName(name).heartsRemaining < cmd.fight.getFighterByName(name).maxHearts()
//        )
//        ||
//        cmd.fight.getFighterByName(name).hp < cmd.fight.getFighterByName(name).hpPerHeart()
//    );
//}
//
//function wasLustHit(cmd:CommandHandler, name:string){
//    return (
//        (
//            cmd.fight.getFighterByName(name).lust == cmd.fight.getFighterByName(name).lustPerOrgasm() &&
//            cmd.fight.getFighterByName(name).orgasmsRemaining < cmd.fight.getFighterByName(name).maxOrgasms()
//        )
//        ||
//        cmd.fight.getFighterByName(name).lust < cmd.fight.getFighterByName(name).lustPerOrgasm()
//    );
//}
//
//function initiateMatchSettings2vs2Tag(cmdHandler){
//    return new Promise((resolve, reject) => {
//        cmdHandler.fight.setFightType("tagteam");
//        cmdHandler.join("Red", {character: "Aelith Blanchette", channel: "here"});
//        cmdHandler.join("Purple", {character: "Purple1", channel: "here"});
//        cmdHandler.join("Purple", {character: "Purple2", channel: "here"});
//        cmdHandler.join("Red", {character: "TheTinaArmstrong", channel: "here"});
//        cmdHandler.ready("Red", {character: "TheTinaArmstrong", channel: "here"});
//        cmdHandler.ready("Red", {character: "Aelith Blanchette", channel: "here"});
//        cmdHandler.ready("Red", {character: "Purple1", channel: "here"});
//        cmdHandler.ready("Red", {character: "Purple2", channel: "here"});
//        resolve();
//    });
//}
//
//function initiateMatchSettings1vs1(cmdHandler){
//    let pro = new Promise((resolve, reject) => {
//        cmdHandler.fight.setFightType("tagteam");
//        resolve();
//    }).then(() => {
//        cmdHandler.join("Red", {character: "Aelith Blanchette", channel: "here"});
//    }).then(() => {
//        cmdHandler.join("Blue", {character: "TheTinaArmstrong", channel: "here"});
//    }).then(() => {
//        cmdHandler.ready("Blue", {character: "TheTinaArmstrong", channel: "here"});
//    }).then(() => {
//        cmdHandler.ready("Red", {character: "Aelith Blanchette", channel: "here"});
//    });
//}
//
//function wasMessageSent(msg){
//    return fChatLibInstance.sendMessage.calls.all().find(x => x.args[0].indexOf(msg) != -1) != undefined;
//}
//
//function refillHPLPFP(cmd, name){
//    cmd.fight.fighterList.getFighterByName(name).orgasmsRemaining = cmd.fight.fighterList.getFighterByName(name).maxOrgasms(); //to prevent ending the fight this way
//    cmd.fight.fighterList.getFighterByName(name).heartsRemaining = cmd.fight.fighterList.getFighterByName(name).maxHearts();
//    cmd.fight.fighterList.getFighterByName(name).consecutiveTurnsWithoutFocus = 0; //to prevent ending the fight this way
//    cmd.fight.fighterList.getFighterByName(name).focus = cmd.fight.fighterList.getFighterByName(name).maxFocus();
//}
///// <reference path="../typings/jasmine/jasmine.d.ts">
//describe("The player(s)", () => {
//
//    var callsToMake = [];
//    var neededInstances = 1000;
//
//    beforeEach(function () {
//        abstractDatabase();
//        fChatLibInstance = {
//            sendMessage: function (message:string, channel:string) {
//                if (debug) {
//                    console.log("Sent MESSAGE " + message + " on channel " + channel);
//                }
//            },
//            throwError: function (s:string) {
//                if (debug) {
//                    console.log("Sent ERROR " + s);
//                }
//            },
//            sendPrivMessage: function (character:string, message:string) {
//                if (debug) {
//                    console.log("Sent PRIVMESSAGE " + message + " to " + character);
//                }
//            }
//        };
//
//        usedIndexes = [];
//        usedFighters = [];
//
//        spyOn(fChatLibInstance, 'sendMessage').and.callThrough();
//        spyOn(fChatLibInstance, 'throwError').and.callThrough();
//        spyOn(fChatLibInstance, 'sendPrivMessage').and.callThrough();
//        spyOn(Fighter, 'exists').and.callThrough();
//
//        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
//        callsToMake = [];
//        neededInstances = 10;
//    }, DEFAULT_TIMEOUT);
//
//    function doMoveInLoop(tier, action, nonRandom, cb){
//        let fight = new Fight(fChatLibInstance, 'here');
//        var first = createFighter("test"+Utils.getRandomInt(0,10000000));
//        var second = createFighter("test"+Utils.getRandomInt(0,10000000));
//        fight.join(first,Team.Blue);
//        fight.join(second,Team.Red);
//        fight.setFighterReady(first);
//        fight.setFighterReady(second);
//        let result = [];
//        let turnsCount = 0;
//        var HPdamagesDone = [];
//        var LPdamagesDone = [];
//        var FPdamagesDone = [];
//        waitUntil().interval(1000).times(50).condition(function(){
//            return (fight.hasStarted && !fight.hasEnded && fight.waitingForAction && fight.fighterList[0] != undefined && fight.fighterList[1] != undefined);
//        }).done((res) => {
//            while(res && !fight.hasEnded) {
//                fight.fighters[0].pendingAction = new FightAction(1, 1, tier, action, fight.fighterList[0], fight.fighterList[1]);
//                if(nonRandom)
//                {
//                    fight.fighters[0].pendingAction.missed = false;
//                    fight.fighters[0].pendingAction.diceScore = 12;
//                }
//                fight.fighters[0].pendingAction.triggerAction();
//                if(nonRandom)
//                {
//                    fight.fighters[0].pendingAction.missed = false;
//                    fight.fighters[0].pendingAction.diceScore = 12;
//                }
//                HPdamagesDone.push(fight.fighters[0].pendingAction.hpDamageToDef);
//                LPdamagesDone.push(fight.fighters[0].pendingAction.lpDamageToDef);
//                FPdamagesDone.push(fight.fighters[0].pendingAction.fpDamageToDef);
//                fight.fighters[0].pendingAction.commit(fight);
//
//                turnsCount++;
//            }
//            result = [turnsCount, HPdamagesDone, LPdamagesDone, FPdamagesDone];
//            cb(null, result);
//        });
//    }
//
//    function calculateFor(tier:Tier, attack:Action, nonRandom:boolean, done: any){
//        var i = 0;
//        while(i < neededInstances){
//            let boundDo = doMoveInLoop.bind(null, tier, attack, nonRandom);
//            callsToMake.push(boundDo);
//            i++;
//        }
//        async.parallel(callsToMake, function(err, res){
//            let turnsData = res.map((x) => x[0]);
//            let hpData = [].concat.apply([], res.map((x) => x[1]));
//            let lpData = [].concat.apply([], res.map((x) => x[2]));
//            let fpData = [].concat.apply([], res.map((x) => x[3]));
//            console.log(`${(nonRandom ? "1":"0")};${Tier[tier]};${Action[attack]};${stats.mean(turnsData)};${stats.median(turnsData)};${stats.variance(turnsData)};${stats.stdev(turnsData)};${stats.percentile(turnsData, 0.90)};${stats.mean(hpData)};${stats.median(hpData)};${stats.variance(hpData)};${stats.stdev(hpData)};${stats.percentile(hpData, 0.90)};${stats.mean(lpData)};${stats.median(lpData)};${stats.variance(lpData)};${stats.stdev(lpData)};${stats.percentile(lpData, 0.90)};${stats.mean(fpData)};${stats.median(fpData)};${stats.variance(fpData)};${stats.stdev(fpData)};${stats.percentile(fpData, 0.90)}`);
//            if(done != null){
//                done();
//            }
//        });
//    }
//
//    xit("should check triggers", function(){
//        let x = EnumEx.getNamesAndValues(Trigger);
//        for(var i = 0; i < x.length; i++){
//            for(var j = 0; j < x.length; j++) {
//                if((x[i].value & x[j].value) != 0){
//                    console.log(`FOUND ${x[i].name} with ${x[j].name} = ${(x[i].value & x[j].value)}`);
//                }
//            }
//        }
//    });
//
//    it("calculates Brawl attacks to end the fight", function (done) {
//        console.log(`Random;Tier;Attack;Mean;Median;Variance;Deviation;99thPercentile;HPMean;HPMedian;HPVariance;HPDeviation;HP99thPercentile;LPMean;LPMedian;LPVariance;LPDeviation;LP99tLPercentile;FPMean;FPMedian;FPVariance;FPDeviation;FP99tFPercentile`);
//        calculateFor(Tier.Light, Action.Brawl, false, null);
//        calculateFor(Tier.Medium, Action.Brawl, false, null);
//        calculateFor(Tier.Heavy, Action.Brawl, false, null);
//        calculateFor(Tier.Light, Action.Brawl, true, null);
//        calculateFor(Tier.Medium, Action.Brawl, true, null);
//        calculateFor(Tier.Heavy, Action.Brawl, true, done);
//    }, 100000);
//
//});
//
//jasmine.execute();
