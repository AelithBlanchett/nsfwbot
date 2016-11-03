import {Table, Column, PrimaryColumn, ManyToMany, JoinTable, OneToMany} from "typeorm";
import {getConnectionManager} from "typeorm/index";
import {Fighter} from "./Fighter";
import {Dice} from "./Dice";
import {Fight} from "./Fight";
import {Team} from "./Constants";
import {Action} from "./Action";
import {Trigger} from "./Constants";
import {TriggerMoment} from "./Constants";
import {FightType} from "./Constants";
import * as Constants from "./Constants";
import {ModifierType} from "./Constants";
import {Tier} from "./Constants";
import {Utils} from "./Utils";
import {FeatureType} from "./Constants";
import {ClassTableChild} from "typeorm/index";
import {ManyToOne} from "typeorm/index";
import {OneToOne} from "typeorm/index";
import {CreateDateColumn} from "typeorm/index";
import {UpdateDateColumn} from "typeorm/index";

@ClassTableChild()
export class ActiveFighter extends Fighter {

    @PrimaryColumn()
    @ManyToOne(type => Fight, fight => fight.fighters, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true
    })
    fight:Fight;
    dice:Dice;

    @OneToOne(type => ActiveFighter, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true
    })
    target:ActiveFighter;

    @Column("int")
    assignedTeam:Team;

    @Column("boolean")
    isReady:boolean = false;

    @Column("int")
    hp:number = 0;

    @Column("int")
    heartsRemaining:number = 0;

    @Column("int")
    lust:number = 0;

    @Column("int")
    orgasmsRemaining:number = 0;

    @Column("int")
    focus:number = 0;

    @Column("int")
    lastDiceRoll:number;

    @Column("boolean")
    isInTheRing:boolean = true;

    @Column("boolean")
    canMoveFromOrOffRing:boolean = true;

    @Column("int")
    lastTagTurn:number = 9999999;

    pendingAction:Action;

    @Column("boolean")
    wantsDraw:boolean = false;

    @Column("int")
    consecutiveTurnsWithoutFocus:number = 0;

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    constructor() {
        super();
        this.dice = new Dice(12);
        this.hp = this.hpPerHeart();
        this.heartsRemaining = this.maxHearts();
        this.lust = 0;
        this.orgasmsRemaining = this.maxOrgasms();
        this.focus = this.willpower;
    }

    //returns dice score
    roll(times:number = 1, event:Trigger = Trigger.Roll):number {
        this.triggerMods(TriggerMoment.Before, event);
        let result = 0;
        if (times == 1) {
            result = this.dice.roll(1);
        }
        else {
            result = this.dice.roll(times);
        }
        this.triggerMods(TriggerMoment.After, event);
        return result;
    }

    triggerMods(moment:TriggerMoment, event:Trigger, objFightAction?:any) {
        for (let mod of this.modifiers) {
            mod.trigger(moment, event, objFightAction);
        }
    }

    removeMod(idMod:string) { //removes a mod, and also its children. If a children has two parent Ids, then it doesn't remove the mod.
        let index = this.modifiers.findIndex(x => x.id == idMod);
        let listOfModsToRemove = [];
        if (index != -1) {
            listOfModsToRemove.push(index);
            for (let mod of this.modifiers) {
                if (mod.parentIds) {
                    if (mod.parentIds.length == 1 && mod.parentIds[0] == idMod) {
                        listOfModsToRemove.push(mod);
                    }
                    else if (mod.parentIds.indexOf(idMod) != -1) {
                        mod.parentIds.splice(mod.parentIds.indexOf(idMod), 1);
                    }
                }

            }
        }
        for (let modIndex of listOfModsToRemove) {
            this.modifiers.splice(modIndex, 1);
        }
    }

    healHP(hp:number, triggerMods:boolean = true) {
        hp = Math.floor(hp);
        if (hp < 1) {
            hp = 1;
        }
        if (triggerMods) {
            this.triggerMods(TriggerMoment.Before, Trigger.HPHealing);
        }
        if (this.hp + hp > this.hpPerHeart()) {
            hp = this.hpPerHeart() - this.hp; //reduce the number if it overflows the bar
        }
        this.hp += hp;
        if (triggerMods) {
            this.triggerMods(TriggerMoment.After, Trigger.HPHealing);
        }
    }

    healLP(lust:number, triggerMods:boolean = true) {
        lust = Math.floor(lust);
        if (lust < 1) {
            lust = 1;
        }
        if (triggerMods) {
            this.triggerMods(TriggerMoment.Before, Trigger.LustHealing);
        }
        if (this.lust - lust < 0) {
            lust = this.lust; //reduce the number if it overflows the bar
        }
        this.lust -= lust;
        if (triggerMods) {
            this.triggerMods(TriggerMoment.After, Trigger.LustHealing);
        }
    }

    healFP(focus:number, triggerMods:boolean = true) {
        focus = Math.floor(focus);
        if (focus < 1) {
            focus = 1;
        }
        if (triggerMods) {
            this.triggerMods(TriggerMoment.Before, Trigger.FocusHealing);
        }
        if (this.focus + focus > this.maxFocus()) {
            focus = this.maxFocus() - this.focus; //reduce the number if it overflows the bar
        }
        this.focus += focus;
        if (triggerMods) {
            this.triggerMods(TriggerMoment.After, Trigger.FocusHealing);
        }
    }

    hitHP(hp:number, triggerMods:boolean = true) {
        hp = Math.floor(hp);
        if (hp < 1) {
            hp = 1;
        }
        if (triggerMods) {
            this.triggerMods(TriggerMoment.Before, Trigger.HPDamage);
        }
        this.hp -= hp;
        if (this.hp <= 0) {
            this.triggerMods(TriggerMoment.Before, Trigger.HeartLoss);
            this.hp = 0;
            this.heartsRemaining--;
            this.fight.message.addHit(`[b][color=red]Heart broken![/color][/b] ${this.name} has ${this.heartsRemaining} hearts left.`);
            if (this.heartsRemaining > 0) {
                this.hp = this.hpPerHeart();
            }
            else if (this.heartsRemaining == 1) {
                this.fight.message.addHit(`[b][color=red]Last heart[/color][/b] for ${this.name}!`);
            }
            this.triggerMods(TriggerMoment.After, Trigger.HeartLoss);
        }
        if (triggerMods) {
            this.triggerMods(TriggerMoment.After, Trigger.HPDamage);
        }
    }

    hitLP(lust:number, triggerMods:boolean = true) {
        lust = Math.floor(lust);
        if (lust < 1) {
            lust = 1;
        }
        if (triggerMods) {
            this.triggerMods(TriggerMoment.Before, Trigger.LustDamage);
        }
        this.lust += lust;
        if (this.lust >= this.lustPerOrgasm()) {
            this.triggerMods(TriggerMoment.Before, Trigger.Orgasm);
            this.lust = 0;
            this.orgasmsRemaining--;
            this.fight.message.addHit(`[b][color=pink]Orgasm on the mat![/color][/b] ${this.name} has ${this.orgasmsRemaining} orgasms left.`);
            this.lust = 0;
            if (triggerMods) {
                this.triggerMods(TriggerMoment.After, Trigger.Orgasm);
            }
            if (this.orgasmsRemaining == 1) {
                this.fight.message.addHit(`[b][color=red]Last orgasm[/color][/b] for ${this.name}!`);
            }
        }
        this.triggerMods(TriggerMoment.After, Trigger.LustDamage);
    }

    hitFP(focusDamage:number, triggerMods:boolean = true) { //focusDamage CAN BE NEGATIVE to gain it
        if (focusDamage <= 0) {
            return;
        }
        focusDamage = Math.floor(focusDamage);
        if (triggerMods) {
            this.triggerMods(TriggerMoment.Before, Trigger.FocusDamage);
        }
        this.focus -= focusDamage;
        if (triggerMods) {
            this.triggerMods(TriggerMoment.After, Trigger.FocusDamage);
        }
        if (this.focus <= this.minFocus()) {
            this.fight.message.addHit(`${this.getStylizedName()} seems way too distracted to possibly continue the fight! Is it their submissiveness? Their morale? One thing's sure, they'll be soon too broken to continue fighting!`);
        }
    }

    triggerInsideRing() {
        this.isInTheRing = true;
    }

    triggerOutsideRing() {
        this.isInTheRing = false;
    }

    triggerPermanentInsideRing() {
        this.isInTheRing = false;
        this.canMoveFromOrOffRing = false;
    }

    triggerPermanentOutsideRing() {
        this.triggerOutsideRing();
        this.canMoveFromOrOffRing = false;
    }

    isDead():boolean {
        return this.heartsRemaining == 0;
    }

    isSexuallyExhausted():boolean {
        return this.orgasmsRemaining == 0;
    }

    isBroken():boolean {
        return this.consecutiveTurnsWithoutFocus >= Constants.Fight.Action.Globals.maxTurnsWithoutFocus;
    }

    isTechnicallyOut():boolean {
        switch (this.fight.fightType) {
            case FightType.Rumble:
            case FightType.Tag:
                return (
                this.isSexuallyExhausted()
                || this.isDead()
                || this.isBroken()
                || this.isCompletelyBound());
            case FightType.LastManStanding:
                return this.isDead();
            case FightType.SexFight:
                return this.isSexuallyExhausted();
            case FightType.Humiliation:
                return this.isBroken() || this.isCompletelyBound();
            case FightType.Bondage:
                return this.isCompletelyBound();
            default:
                return false;
        }

    }

    bondageItemsOnSelf():number {
        let bondageModCount = 0;
        for (let mod of this.modifiers) {
            if (mod.name == Constants.Modifier.Bondage) {
                bondageModCount++;
            }
        }
        return bondageModCount;
    }

    requestDraw() {
        this.wantsDraw = true;
    }

    isRequestingDraw():boolean {
        return this.wantsDraw;
    }

    isCompletelyBound():boolean {
        return this.bondageItemsOnSelf() >= Constants.Fight.Action.Globals.maxBondageItemsOnSelf;
    }

    isStunned():boolean {
        let isStunned = false;
        for (let mod of this.modifiers) {
            if (mod.receiver == this && mod.type == ModifierType.Stun) {
                isStunned = true;
            }
        }
        return isStunned;
    }

    isInHold():boolean {
        let isInHold = false;
        for (let mod of this.modifiers) {
            if (mod.receiver == this && (mod.name == Constants.Modifier.SubHold || mod.name == Constants.Modifier.SexHold || mod.name == Constants.Modifier.HumHold )) {
                isInHold = true;
            }
        }
        return isInHold;
    }

    isInSpecificHold(holdName:string):boolean {
        let isInHold = false;
        for (let mod of this.modifiers) {
            if (mod.receiver == this && mod.name == holdName) {
                isInHold = true;
            }
        }
        return isInHold;
    }

    isInHoldOfTier():Tier {
        let tier = Tier.None;
        for (let mod of this.modifiers) {
            if (mod.receiver == this && (mod.name == Constants.Modifier.SubHold || mod.name == Constants.Modifier.SexHold || mod.name == Constants.Modifier.HumHold )) {
                tier = mod.tier;
            }
        }
        return tier;
    }

    escapeHolds() {
        for (let mod of this.modifiers) {
            if (mod.receiver == this && (mod.name == Constants.Modifier.SubHold || mod.name == Constants.Modifier.SexHold || mod.name == Constants.Modifier.HumHold )) {
                this.removeMod(mod.id);
            }
        }
    }

    outputStatus() {
        return Utils.pad(64, `${this.getStylizedName()}:`, " ") +
            `  ${this.hp}/${this.hpPerHeart()} [color=red]HP[/color]  |` +
            `  ${this.heartsRemaining}/${this.maxHearts()} [color=red]Hearts[/color]  ------` +
            `  ${this.lust}/${this.lustPerOrgasm()} [color=pink]Lust[/color]  |` +
            `  ${this.orgasmsRemaining}/${this.maxOrgasms()} [color=pink]Orgasms[/color]  ------` +
            `  [color=red]${this.minFocus()}[/color]|[b]${this.focus}[/b]|[color=orange]${this.maxFocus()}[/color] ${this.hasFeature(FeatureType.DomSubLover) ? "Submissiveness" : "Focus"}  |` +
            `  ${this.consecutiveTurnsWithoutFocus}/[color=orange]${Constants.Fight.Action.Globals.maxTurnsWithoutFocus}[/color] Turns ${this.hasFeature(FeatureType.DomSubLover) ? "being too submissive" : "without focus"}  ------` +
            `  ${this.bondageItemsOnSelf()}/${Constants.Fight.Action.Globals.maxBondageItemsOnSelf} [color=purple]Bondage Items[/color]  ------` +
            `  [color=red]Target:[/color] ` + (this.target != undefined ? `${this.target.getStylizedName()}` : "None");
    }

    getStylizedName() {
        let modifierBeginning = "";
        let modifierEnding = "";
        if (this.isTechnicallyOut()) {
            modifierBeginning = `[s]`;
            modifierEnding = `[/s]`;
        }
        else if (!this.isInTheRing) {
            modifierBeginning = `[i]`;
            modifierEnding = `[/i]`;
        }
        return `${modifierBeginning}[b][color=${Team[this.assignedTeam].toLowerCase()}]${this.name}[/color][/b]${modifierEnding}`;
    }

}