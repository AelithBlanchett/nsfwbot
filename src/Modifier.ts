import * as Constants from "./Constants";
import Trigger = Constants.Trigger;
import {Utils} from "./Utils";
import ModifierType = Constants.ModifierType;
import TriggerMoment = Constants.TriggerMoment;
import {Tier} from "./Constants";
import {ActiveFighter} from "./ActiveFighter";
import {IModifier} from "./interfaces/IModifier";
import {Fight} from "./Fight";

export class Modifier implements IModifier{
    idModifier: string;
    idFight:string;
    name:string = "modifier";
    tier:Tier;
    type:ModifierType;
    idApplier:string;
    idReceiver:string;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    hpHeal: number;
    lustHeal: number;
    focusHeal: number;
    areDamageMultipliers: boolean = false;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    event:Trigger;
    timeToTrigger:TriggerMoment;
    idParentActions:Array<string>;

    fight:Fight;
    applier:ActiveFighter;
    receiver:ActiveFighter;

    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;

    constructor(receiver:string, applier:string, tier:Tier, modType:ModifierType, hpDamage:number, lustDamage:number, focusDamage:number, diceRoll:number, escapeRoll:number, uses:number,
                timeToTrigger:TriggerMoment, event:Trigger, parentActionIds:Array<string>, areMultipliers:boolean){
        this.idModifier = Utils.generateUUID();
        this.idReceiver = receiver;
        this.idApplier = applier;
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
        this.idParentActions = parentActionIds;
        this.areDamageMultipliers = areMultipliers;
        this.name = Constants.Modifier[ModifierType[modType]];
    }

    build(receiver:ActiveFighter, applier:ActiveFighter, fight:Fight){
        this.receiver = receiver;
        this.applier = applier;
        this.fight = fight;
        this.idFight = fight.idFight;
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
            let messageAboutModifier = "";
            this.uses--;
            messageAboutModifier = `${this.receiver.getStylizedName()} is still affected by the ${this.name}, `;
            if(!objFightAction){
                if(this.hpDamage > 0){
                    let flagTriggerMods = ((event & Constants.Trigger.HPDamage) == 0);
                    messageAboutModifier += ` losing ${this.hpDamage} HP,`;
                    this.receiver.hitHP(this.hpDamage, flagTriggerMods);
                }
                if(this.lustDamage > 0){
                    let flagTriggerMods = ((event & Constants.Trigger.LustDamage) == 0);
                    messageAboutModifier += ` losing ${this.lustDamage} LP,`;
                    this.receiver.hitLP(this.lustDamage, flagTriggerMods);
                }
                if(this.focusDamage > 0){
                    let flagTriggerMods = ((event & Constants.Trigger.FocusDamage) == 0);
                    messageAboutModifier += ` losing ${this.focusDamage} FP,`;
                    this.receiver.hitFP(this.focusDamage, flagTriggerMods);
                }
                if(this.hpHeal > 0){
                    let flagTriggerMods = ((event & Constants.Trigger.HPHealing) == 0);
                    messageAboutModifier += ` gaining ${this.hpHeal} HP,`;
                    this.receiver.healHP(this.hpHeal, flagTriggerMods);
                }
                if(this.lustHeal > 0){
                    let flagTriggerMods = ((event & Constants.Trigger.LustHealing) == 0);
                    messageAboutModifier += ` gaining ${this.lustHeal} LP,`;
                    this.receiver.healLP(this.lustHeal, flagTriggerMods);
                }
                if(this.focusHeal > 0){
                    let flagTriggerMods = ((event & Constants.Trigger.FocusHealing) == 0);
                    messageAboutModifier += ` gaining ${this.focusHeal} FP,`;
                    this.receiver.healFP(this.focusHeal, flagTriggerMods);
                }
                if(this.diceRoll != 0){
                    this.receiver.dice.addTmpMod(this.diceRoll,1);
                    if(this.diceRoll > 0){
                        messageAboutModifier += ` getting a +${this.diceRoll} bonus for their dice roll,`;
                    }
                    else{
                        messageAboutModifier += ` getting a ${this.diceRoll} penalty for their dice roll,`;
                    }
                }
            }
            else{
                if(this.hpDamage > 0){
                    if(this.areDamageMultipliers){
                        objFightAction.hpDamage *= this.hpDamage;
                        messageAboutModifier += ` multiplying their attack's HP damage by ${this.hpDamage},`;
                    }
                    else{
                        let flagTriggerMods = !(event & Constants.Trigger.HPDamage);
                        messageAboutModifier += ` losing ${this.hpDamage} HP,`;
                        this.receiver.hitHP(this.hpDamage, flagTriggerMods);
                    }
                }
                if(this.lustDamage > 0){
                    if(this.areDamageMultipliers){
                        objFightAction.lustDamage *= this.lustDamage;
                        messageAboutModifier += ` multiplying their attack's LP damage by ${this.lustDamage},`;
                    }
                    else {
                        let flagTriggerMods = !(event & Constants.Trigger.LustDamage);
                        messageAboutModifier += ` losing ${this.lustDamage} LP,`;
                        this.receiver.hitLP(this.lustDamage, flagTriggerMods);
                    }
                }
                if(this.focusDamage > 0){
                    if(this.areDamageMultipliers){
                        objFightAction.focusDamage *= this.focusDamage;
                        messageAboutModifier += ` multiplying their attack's FP damage by ${this.focusDamage},`;
                    }
                    else {
                        let flagTriggerMods = !(event & Constants.Trigger.LustDamage);
                        messageAboutModifier += ` losing ${this.focusDamage} LP,`;
                        this.receiver.hitFP(this.focusDamage, flagTriggerMods);
                    }
                }
                if(this.hpHeal > 0){
                    if(this.areDamageMultipliers){
                        objFightAction.hpHeal *= this.hpHeal;
                        messageAboutModifier += ` multiplying their action's HP healing by ${this.hpHeal},`;
                    }
                    else{
                        let flagTriggerMods = !(event & Constants.Trigger.HPHealing);
                        messageAboutModifier += ` gaining ${this.hpHeal} HP,`;
                        this.receiver.healHP(this.hpHeal, flagTriggerMods);
                    }
                }
                if(this.lustHeal > 0){
                    if(this.areDamageMultipliers){
                        objFightAction.lustHeal *= this.lustHeal;
                        messageAboutModifier += ` multiplying their action's LP healing by ${this.lustHeal},`;
                    }
                    else {
                        let flagTriggerMods = !(event & Constants.Trigger.LustHealing);
                        messageAboutModifier += ` gaining ${this.lustHeal} LP,`;
                        this.receiver.healLP(this.lustHeal, flagTriggerMods);
                    }
                }
                if(this.focusHeal > 0){
                    if(this.areDamageMultipliers){
                        objFightAction.focusHeal *= this.focusHeal;
                        messageAboutModifier += ` multiplying their action's FP healing by ${this.focusHeal},`;
                    }
                    else {
                        let flagTriggerMods = !(event & Constants.Trigger.FocusHealing);
                        messageAboutModifier += ` gaining ${this.focusHeal} LP,`;
                        this.receiver.healFP(this.focusHeal, flagTriggerMods);
                    }
                }
                if(this.diceRoll != 0){
                    objFightAction.diceScore += this.diceRoll;
                    if(this.diceRoll > 0){
                        messageAboutModifier += ` getting a +${this.diceRoll} bonus for their dice roll,`;
                    }
                    else{
                        messageAboutModifier += ` getting a ${this.diceRoll} penalty for their dice roll,`;
                    }
                }
            }

            if(this.isOver()){
                this.receiver.removeMod(this.idModifier);
                messageAboutModifier += ` and it is now expired.`;
            }
            else{
                messageAboutModifier += ` still effective for ${this.uses} more turns.`;
            }

            this.fight.message.addSpecial(messageAboutModifier);
            //this.fight.message.send();
        }
    }
}