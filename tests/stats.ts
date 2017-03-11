import {Fighter} from "../src/Fighter";
import {Fight} from "../src/Fight";
import {IFChatLib} from "../src/interfaces/IFChatLib";
import {CommandHandler} from "../src/CommandHandler";
import * as Constants from "../src/Constants";
import Tier = Constants.Tier;
import {Utils} from "../src/Utils";
import {ActionType, Action} from "../src/Action";
import {StunModifier} from "../src/CustomModifiers";
import {EnumEx} from "../src/Utils";
import Trigger = Constants.Trigger;
import {Feature} from "../src/Feature";
import {FeatureType} from "../src/Constants";
import {ItemPickupModifier} from "../src/CustomModifiers";
import {ModifierType} from "../src/Constants";
var waitUntil = require('wait-until');
var Jasmine = require('jasmine');
var async = require('async');
var stats = require('stats-lite');
import {ActiveFighter} from "../src/ActiveFighter";
import {FighterRepository} from "../src/FighterRepository";
import {ActiveFighterRepository} from "../src/ActiveFighterRepository";
import {ActionRepository} from "../src/ActionRepository";
import {FightRepository} from "../src/FightRepository";
import {Dice} from "../src/Dice";
import {Team} from "../src/Constants";
import {TierDifficulty} from "../src/Constants";
import {BaseDamage} from "../src/Constants";
var jasmine = new Jasmine();
var fChatLibInstance:any;
var debug = false;
var mockedClasses = [];
var usedIndexes = [];
var usedFighters = [];

const DEFAULT_TIMEOUT = 15000;
const INTERVAL_TO_WAIT_FOR = 5;

function getMock(mockedClass) {
    if (mockedClasses.indexOf(mockedClass) != -1) {
        return new mockedClasses[mockedClasses.indexOf(mockedClass)]();
    }
    Object.getOwnPropertyNames(mockedClass.prototype).forEach(m => spyOn(mockedClass.prototype, m).and.callThrough());
    mockedClasses.push(mockedClass);

    return new mockedClass();
}

//
//Abstraction of database layer
//

function abstractDatabase() {

    FighterRepository.load = async function (name) {
        return new Promise(function (resolve, reject) {
            resolve(createFighter(name));
        });
    };

    ActiveFighterRepository.initialize = async function (name) {
        let fighter = createFighter(name);
        return fighter;
    };

    ActiveFighterRepository.exists = async function (a, b) {
        return false;
    };

    ActiveFighterRepository.load = async function (name, fightId) {
        return new Promise(function (resolve, reject) {
            resolve(createFighter(name));
        });
    };

    ActionRepository.persist = async function (action) {
        return new Promise<void>(function (resolve, reject) {
            action.idAction = Utils.generateUUID();
            resolve();
        });
    };

    FightRepository.persist = async function (fight) {
        return new Promise<void>(function (resolve, reject) {
            resolve();
        });
    };

    FighterRepository.persist = async function (fight) {
        return new Promise<void>(function (resolve, reject) {
            resolve();
        });
    };

    FighterRepository.exists = async function (a) {
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    };

    FightRepository.exists = async function (fight) {
        return false;
    };

    FightRepository.load = async function (id) {
        return new Fight();
    };
}

//Utilities

function createFighter(name, intStatsToAssign:number = 50):ActiveFighter {
    let myFighter;
    if (Utils.findIndex(usedFighters, "name", name) == -1) {
        myFighter = getMock(ActiveFighter);
        let randomId = -1;
        do {
            randomId = Utils.getRandomInt(0, 1000000);
        } while (usedIndexes.indexOf(randomId) != -1);
        myFighter.power = myFighter.dexterity = myFighter.sensuality = myFighter.toughness = myFighter.willpower = myFighter.endurance = intStatsToAssign;
        myFighter.startingPower = intStatsToAssign;
        myFighter.startingEndurance = intStatsToAssign;
        myFighter.startingSensuality = intStatsToAssign;
        myFighter.startingToughness = intStatsToAssign;
        myFighter.startingWillpower = intStatsToAssign;
        myFighter.startingDexterity = intStatsToAssign;
        myFighter.dexterityDelta = 0;
        myFighter.enduranceDelta = 0;
        myFighter.powerDelta = 0;
        myFighter.sensualityDelta = 0;
        myFighter.toughnessDelta = 0;
        myFighter.willpowerDelta = 0;
        myFighter.id = randomId;
        myFighter.name = name;
        myFighter.hp = myFighter.hpPerHeart();
        myFighter.heartsRemaining = myFighter.maxHearts();
        myFighter.lust = 0;
        myFighter.orgasmsRemaining = myFighter.maxOrgasms();
        myFighter.focus = 0;
        myFighter.dice = new Dice(10);
        usedFighters.push(myFighter);
    }
    else {
        myFighter = usedFighters[Utils.findIndex(usedFighters, "name", name)];
    }

    return myFighter;
}

function doAction(cmd:CommandHandler, action:string, target:string = "", condition?:any) {
    return new Promise((resolve, reject) => {
        if (!condition) {
            condition = () => {
                return (cmd.fight.hasStarted && !cmd.fight.hasEnded && cmd.fight.waitingForAction && cmd.fight.currentTurn > 0);
            };
        }
        waitUntil().interval(10).times(50).condition(condition).done((res) => {
            if (res) {
                cmd.fight.currentPlayer.dice.addMod(50);
                cmd[action](target, {character: cmd.fight.currentPlayer.name, channel: "here"});
                waitUntil().interval(INTERVAL_TO_WAIT_FOR).times(50).condition(condition).done(() => {
                    resolve();
                });
            }
            else {
                reject("Couldn't execute action. Is the fight started and waiting for action?");
            }
        });
    });
}


function wasHealthHit(cmd:CommandHandler, name:string) {
    return (
        (
            cmd.fight.getFighterByName(name).hp == cmd.fight.getFighterByName(name).hpPerHeart() &&
            cmd.fight.getFighterByName(name).heartsRemaining < cmd.fight.getFighterByName(name).maxHearts()
        )
        ||
        cmd.fight.getFighterByName(name).hp < cmd.fight.getFighterByName(name).hpPerHeart()
    );
}

function wasLustHit(cmd:CommandHandler, name:string) {
    return (
        (
            cmd.fight.getFighterByName(name).lust == cmd.fight.getFighterByName(name).lustPerOrgasm() &&
            cmd.fight.getFighterByName(name).orgasmsRemaining < cmd.fight.getFighterByName(name).maxOrgasms()
        )
        ||
        cmd.fight.getFighterByName(name).lust < cmd.fight.getFighterByName(name).lustPerOrgasm()
    );
}

async function initiateMatchSettings2vs2Tag(cmdHandler) {
    cmdHandler.fight.setFightType("tagteam");
    await cmdHandler.join("Red", {character: "Aelith Blanchette", channel: "here"});
    await cmdHandler.join("Purple", {character: "Purple1", channel: "here"});
    await cmdHandler.join("Purple", {character: "Purple2", channel: "here"});
    await cmdHandler.join("Red", {character: "TheTinaArmstrong", channel: "here"});
    await cmdHandler.ready("Red", {character: "TheTinaArmstrong", channel: "here"});
    await cmdHandler.ready("Red", {character: "Aelith Blanchette", channel: "here"});
    await cmdHandler.ready("Red", {character: "Purple1", channel: "here"});
    await cmdHandler.ready("Red", {character: "Purple2", channel: "here"});
}

async function initiateMatchSettings1vs1(cmdHandler) {
    cmdHandler.fight.setFightType("tagteam");
    await cmdHandler.join("Red", {character: "Aelith Blanchette", channel: "here"});
    await cmdHandler.join("Blue", {character: "TheTinaArmstrong", channel: "here"});
    await cmdHandler.ready("Blue", {character: "TheTinaArmstrong", channel: "here"});
    await cmdHandler.ready("Red", {character: "Aelith Blanchette", channel: "here"});
}

function wasMessageSent(msg) {
    return fChatLibInstance.sendMessage.calls.all().find(x => x.args[0].indexOf(msg) != -1) != undefined;
}

function wasPrivMessageSent(msg) {
    return fChatLibInstance.sendPrivMessage.calls.all().find(x => x.args[0].indexOf(msg) != -1) != undefined;
}

function refillHPLPFP(cmd, name) {
    cmd.fight.getFighterByName(name).orgasmsRemaining = cmd.fight.getFighterByName(name).maxOrgasms(); //to prevent ending the fight this way
    cmd.fight.getFighterByName(name).heartsRemaining = cmd.fight.getFighterByName(name).maxHearts();
    cmd.fight.getFighterByName(name).consecutiveTurnsWithoutFocus = 0; //to prevent ending the fight this way
    cmd.fight.getFighterByName(name).focus = cmd.fight.getFighterByName(name).maxFocus();
}

/// <reference path="../typings/jasmine/jasmine.d.ts">
describe("The player(s)", () => {

    var callsToMake = [];
    var neededInstances = 2;

    beforeEach(function () {
        abstractDatabase();
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

        usedIndexes = [];
        usedFighters = [];

        spyOn(fChatLibInstance, 'sendMessage').and.callThrough();
        spyOn(fChatLibInstance, 'throwError').and.callThrough();
        spyOn(fChatLibInstance, 'sendPrivMessage').and.callThrough();
        spyOn(ActiveFighterRepository, 'load').and.callThrough();
        spyOn(ActiveFighterRepository, 'initialize').and.callThrough();
        spyOn(FighterRepository, 'load').and.callThrough();
        spyOn(FighterRepository, 'exists').and.callThrough();
        spyOn(ActiveFighterRepository, 'exists').and.callThrough();
        spyOn(ActionRepository, 'persists').and.callThrough();

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        callsToMake = [];
        neededInstances = 1;
    }, DEFAULT_TIMEOUT);

    async function doMoveInLoop(tier, action, nonRandom, cb){
        let fight = new Fight();
        fight.build(fChatLibInstance, 'here');
        var first = createFighter("test"+Utils.getRandomInt(0,10000000));
        var second = createFighter("test"+Utils.getRandomInt(0,10000000));
        await fight.join(first.name,Team.Blue);
        await fight.join(second.name,Team.Red);
        await fight.setFighterReady(first.name);
        await fight.setFighterReady(second.name);
        let result = [];
        let turnsCount = 0;
        var HPdamagesDone = [];
        var LPdamagesDone = [];
        var FPdamagesDone = [];
        waitUntil().interval(1000).times(50).condition(function(){
            return (fight.hasStarted && !fight.hasEnded && fight.waitingForAction && fight.fighters[0] != undefined && fight.fighters[1] != undefined);
        }).done(async (res) => {
            while(res && !fight.hasEnded) {
                fight.fighters[0].pendingAction = new Action("1", 1, action, tier, fight.fighters[0].name, fight.fighters[1].name);
                fight.fighters[0].pendingAction.buildAction(fight, fight.fighters[0], fight.fighters[1]);
                if(nonRandom)
                {
                    fight.fighters[0].pendingAction.missed = false;
                    fight.fighters[0].pendingAction.diceScore = 12;
                }
                fight.fighters[0].pendingAction.triggerAction();
                if(nonRandom)
                {
                    fight.fighters[0].pendingAction.missed = false;
                    fight.fighters[0].pendingAction.diceScore = 12;
                }
                HPdamagesDone.push(fight.fighters[0].pendingAction.hpDamageToDef);
                LPdamagesDone.push(fight.fighters[0].pendingAction.lpDamageToDef);
                FPdamagesDone.push(fight.fighters[0].pendingAction.fpDamageToDef);
                await fight.fighters[0].pendingAction.commit(fight);

                turnsCount++;
            }
            result = [turnsCount, HPdamagesDone, LPdamagesDone, FPdamagesDone];
            cb(null, result);
        });
    }

    async function doMoveInLoop2(tier, action, nonRandom, cb){
        // let result = [];
        // let turnsCount = 0;
        // let firstFighter = createFighter("test"+Utils.getRandomInt(0,10000000));
        // let damagesDone = [];
        // let die = new Dice(Constants.Globals.diceSides);
        // let dieScore = die.roll(1);
        //
        // let totalHp = 100;
        //
        // if(nonRandom) {
        //     dieScore = 12;
        // }
        //
        // while(firstFighter.totalHp() > 0)
        //     let damagePerTier = attackFormula(tier, firstFighter.power, firstFighter.toughness, dieScore);
        // damagesDone.push(damagePerTier);
        //
        // turnsCount++;
        // result = [turnsCount, HPdamagesDone, LPdamagesDone, FPdamagesDone];
        // cb(null, result);
    }

    function calculateFor2(tier:Tier, attack:ActionType, nonRandom:boolean, done: any){
        var i = 0;
        while(i < neededInstances){
            let boundDo = doMoveInLoop2.bind(null, tier, attack, nonRandom);
            callsToMake.push(boundDo);
            i++;
        }
        async.parallel(callsToMake, function(err, res){
            let turnsData = res.map((x) => x[0]);
            let hpData = [].concat.apply([], res.map((x) => x[1]));
            let lpData = [].concat.apply([], res.map((x) => x[2]));
            let fpData = [].concat.apply([], res.map((x) => x[3]));

            console.log(`${(nonRandom ? "1":"0")};${Tier[tier]};${ActionType[attack]};${stats.mean(turnsData)};${stats.median(turnsData)};${stats.variance(turnsData)};${stats.stdev(turnsData)};${stats.percentile(turnsData, 0.90)};${stats.mean(hpData)};${stats.median(hpData)};${stats.variance(hpData)};${stats.stdev(hpData)};${stats.percentile(hpData, 0.90)};${stats.mean(lpData)};${stats.median(lpData)};${stats.variance(lpData)};${stats.stdev(lpData)};${stats.percentile(lpData, 0.90)};${stats.mean(fpData)};${stats.median(fpData)};${stats.variance(fpData)};${stats.stdev(fpData)};${stats.percentile(fpData, 0.90)}`);

            res = null;
            turnsData = null;
            hpData = null;
            lpData = null;
            fpData = null;
            if(done != null){
                done();
            }
            callsToMake = null;
        });
    }

    function attackFormula(tier:Tier, actorAtk:number, targetDef:number, roll:number){
        var statDiff = 0;
        if(actorAtk-targetDef > 0){
            statDiff = Math.ceil((actorAtk-targetDef) / 10);
        }
        var diceBonus = 0;
        var calculatedBonus = Math.floor(roll - TierDifficulty.Light);
        if(calculatedBonus > 0){
            diceBonus = calculatedBonus;
        }
        return BaseDamage[Tier[tier]] + statDiff + diceBonus;
    }

    xit("should check triggers", function(){
        let x = EnumEx.getNamesAndValues(Trigger);
        for(var i = 0; i < x.length; i++){
            for(var j = 0; j < x.length; j++) {
                if((x[i].value & x[j].value) != 0){
                    console.log(`FOUND ${x[i].name} with ${x[j].name} = ${(x[i].value & x[j].value)}`);
                }
            }
        }
    });

    it("calculates Brawl attacks to end the fight", function (done) {
        // console.log(`Random;Tier;Attack;Mean;Median;Variance;Deviation;99thPercentile;HPMean;HPMedian;HPVariance;HPDeviation;HP99thPercentile;LPMean;LPMedian;LPVariance;LPDeviation;LP99tLPercentile;FPMean;FPMedian;FPVariance;FPDeviation;FP99tFPercentile`);
        // let tierList = Utils.getEnumList(Tier);
        // let attackList = [
        //     ActionType.Brawl,
        //     ActionType.SexStrike,
        //     ActionType.SubHold,
        //     ActionType.SexHold,
        //     ActionType.Degradation,
        //     ActionType.ForcedWorship,
        //     ActionType.HighRisk,
        //     ActionType.Penetration,
        //     ActionType.Stun,
        //     ActionType.StrapToy
        // ];
        //
        // attackList = [ActionType.SubHold];
        //
        // for(let atk of attackList){
        //     for(let tier of tierList){
        //         calculateFor(Tier[tier], atk, false, null);
        //     }
        // }
        //
        // calculateFor(0, 0, false, done);

    }, 1000000000);

});

jasmine.execute();
