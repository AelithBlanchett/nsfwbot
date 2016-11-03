import {Fighter} from "./Fighter";
import * as Constants from "./Constants";
import Trigger = Constants.Trigger;
import {Utils} from "./Utils";
import ModifierType = Constants.ModifierType;
import TriggerMoment = Constants.TriggerMoment;
import {Tier} from "./Constants";
import {ActionType, Action} from "./Action";
import {ManyToOne} from "typeorm";
var ES = require("es-abstract/es6.js");

export interface IModifier{
    id: string;
    name:string;
    tier:Tier;
    type:ModifierType;
    applier: Fighter;
    receiver: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    areDamageMultipliers: boolean;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    parentAction: Action;
    event:Trigger;
    timeToTrigger:TriggerMoment;
    parentIds: Array<string>;

    isOver():boolean;
    trigger(moment: TriggerMoment, event:Trigger, objFightAction?:any):void;
    willTriggerForEvent(moment: TriggerMoment, event:Trigger):boolean;
}

export class Modifier implements IModifier{
    id: string;
    name:string = "modifier";
    tier:Tier;
    type:ModifierType;
    applier: Fighter;
    receiver: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    areDamageMultipliers: boolean = false;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    event:Trigger;
    timeToTrigger:TriggerMoment;
    parentIds: Array<string>;

    @ManyToOne(type => Action, act => act.modifiers, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true
    })
    parentAction:Action;

    constructor(receiver:Fighter, applier:Fighter, tier:Tier, modType:ModifierType, hpDamage:number, lustDamage:number, focusDamage: number, diceRoll: number, escapeRoll: number, uses:number,
                timeToTrigger:TriggerMoment, event:Trigger, parentIds:Array<string>, areMultipliers:boolean){
        this.id = Utils.generateUUID();
        this.receiver = receiver; //ALWAYS filled!
        this.applier = applier; //can be null
        this.tier = tier;
        this.type = modType;
        this.hpDamage = hpDamage;
        this.lustDamage = lustDamage;
        this.focusDamage = focusDamage;
        this.diceRoll = diceRoll;
        this.escapeRoll = escapeRoll; //unused
        this.uses = uses;
        this.event = event;
        this.timeToTrigger = timeToTrigger;
        this.parentIds = parentIds;
        this.areDamageMultipliers = areMultipliers;
        this.name = Constants.Modifier[ModifierType[modType]];
    }

    isOver():boolean{
        return (this.uses <= 0 || this.receiver.isDead() || this.receiver.isSexuallyExhausted());
    }

    willTriggerForEvent(moment: TriggerMoment, event:Trigger):boolean{
        let canPass = false;
        if(event & this.event){
            if(moment & this.timeToTrigger){
                canPass = true;
            }
        }
        return canPass;
    }

    trigger(moment: TriggerMoment, event:Trigger, objFightAction?:any):void{
        if(this.willTriggerForEvent(moment, event)){
            this.receiver.fight.message.addInfo(`${this.receiver.getStylizedName()} is still affected by the ${this.name}!`);
            this.uses--;
            if(!objFightAction){
                if(this.hpDamage > 0){
                    let flagTriggerMods = ((event & Constants.Trigger.HPDamage) == 0);
                    this.receiver.hitHP(this.hpDamage, flagTriggerMods);
                }
                if(this.lustDamage > 0){
                    let flagTriggerMods = ((event & Constants.Trigger.LustDamage) == 0);
                    this.receiver.hitLP(this.lustDamage, flagTriggerMods);
                }
                if(this.diceRoll != 0){
                    this.receiver.dice.addTmpMod(this.diceRoll,1);
                    this.receiver.fight.message.addInfo(`${this.receiver.getStylizedName()} got a ${this.diceRoll} penalty applied on their dice roll.`);
                }
                if(this.focusDamage > 0){
                    let flagTriggerMods = ((event & Constants.Trigger.FocusDamage) == 0);
                    this.receiver.hitFP(this.focusDamage, flagTriggerMods);
                }
            }
            else{
                if(this.hpDamage > 0){
                    if(this.areDamageMultipliers){
                        objFightAction.hpDamage *= this.hpDamage;
                    }
                    else{
                        let flagTriggerMods = !(event & Constants.Trigger.HPDamage);
                        this.receiver.hitHP(this.hpDamage, flagTriggerMods);
                    }

                }
                if(this.lustDamage > 0){
                    if(this.areDamageMultipliers){
                        objFightAction.lustDamage *= this.lustDamage;
                    }
                    else {
                        let flagTriggerMods = !(event & Constants.Trigger.LustDamage);
                        this.receiver.hitLP(this.lustDamage, flagTriggerMods);
                    }
                }
                if(this.diceRoll != 0){
                    objFightAction.diceScore += this.diceRoll;
                    this.receiver.fight.message.addInfo(`${this.receiver.getStylizedName()} got a ${this.diceRoll} penalty applied on their dice roll.`);
                }
                if(this.focusDamage > 0){
                    if(this.areDamageMultipliers){
                        objFightAction.focusDamage *= this.focusDamage;
                    }
                    else {
                        let flagTriggerMods = !(event & Constants.Trigger.LustDamage);
                        this.receiver.hitFP(this.focusDamage, flagTriggerMods);
                    }
                }
            }

            this.receiver.fight.message.send();
            if(this.isOver()){
                this.receiver.removeMod(this.id);
            }
        }
    }
}