import {Fighter} from "./Fighter";
import * as Constants from "./Constants";
import Tier = Constants.Tier;
import {Data} from "./Model";
import BaseDamage = Constants.BaseDamage;
import {Fight} from "./Fight";
import {Dice} from "./Dice";
import TierDifficulty = Constants.TierDifficulty;
import Trigger = Constants.Trigger;
import Action = Constants.Action;
import {Modifier} from "./Modifier";
import {Promise} from "es6-promise";
import FocusDamageHum = Constants.FocusDamageHumHold;
import TokensPerWin = Constants.TokensPerWin;
import FightTier = Constants.FightTier;
import {Modifiers} from "./Modifier";
import {BondageModifier} from "./CustomModifiers";
import {HoldModifier} from "./CustomModifiers";
import ModifierType = Constants.ModifierType;
import {LustBonusSexHoldModifier} from "./CustomModifiers";
import {BrawlBonusSubHoldModifier} from "./CustomModifiers";
import {ItemPickupModifier} from "./CustomModifiers";
import {SextoyPickupModifier} from "./CustomModifiers";
import {DegradationModifier} from "./CustomModifiers";
import {StunModifier} from "./CustomModifiers";
import TriggerMoment = Constants.TriggerMoment;
import {HighRiskMultipliers} from "./Constants";
import {Utils} from "./Utils";
import {StrapToyModifier} from "./CustomModifiers";
import {StrapToyLPDamagePerTurn} from "./Constants";

export class FightAction{
    id: number;
    fightId: number;
    atTurn: number;
    type: Action;
    tier: Tier;
    isHold: boolean;
    modifiers: Modifiers;
    attacker: Fighter;
    defender: Fighter;
    hpDamageToDef: number;
    lpDamageToDef: number;
    fpDamageToDef: number;
    hpDamageToAtk: number;
    lpDamageToAtk: number;
    fpDamageToAtk: number;
    hpHealToDef: number;
    lpHealToDef: number;
    fpHealToDef: number;
    hpHealToAtk: number;
    lpHealToAtk: number;
    fpHealToAtk: number;
    diceScore: number;
    missed: boolean;
    requiresRoll: boolean;

    constructor(fightId:number, currentTurn:number, tier:Tier, actionType:Action, attacker:Fighter, defender?:Fighter) {
        this.fightId = fightId;
        this.isHold = false;
        this.modifiers = new Modifiers();
        this.missed = true;
        this.hpDamageToDef = 0;
        this.lpDamageToDef = 0;
        this.fpDamageToDef = 0;
        this.hpDamageToAtk = 0;
        this.lpDamageToAtk = 0;
        this.fpDamageToAtk = 0;
        this.hpHealToDef = 0;
        this.lpHealToDef = 0;
        this.fpHealToDef = 0;
        this.hpHealToAtk = 0;
        this.lpHealToAtk = 0;
        this.fpHealToAtk = 0;
        this.diceScore = 0;
        this.tier = tier;
        this.atTurn = currentTurn;
        this.attacker = attacker;
        this.defender = defender;
        this.requiresRoll = true;
        this.type = actionType;
    }

    attackFormula(tier:Tier, actorAtk:number, targetDef:number, roll:number):number{
        var statDiff = 0;
        if(actorAtk-targetDef > 0){
            statDiff = (actorAtk-targetDef);
        }
        var diceBonus = 0;
        var calculatedBonus = Math.floor(roll - TierDifficulty.Light);
        if(calculatedBonus > 0){
            diceBonus = calculatedBonus;
        }
        return BaseDamage[Tier[tier]] + statDiff + diceBonus;
    }

    requiredDiceScore():number{
        let scoreRequired = 0;
        if(this.type == Constants.Action.Finish){
            scoreRequired += 6;
        }
        if(this.type == Constants.Action.Rest){
            scoreRequired = Constants.Fight.Action.RequiredScore.Rest;
        }
        else if(this.type == Constants.Action.Tag){
            scoreRequired = Constants.Fight.Action.RequiredScore.Tag;
        }
        else{
            scoreRequired += (Constants.Fight.Action.Globals.difficultyIncreasePerBondageItem * this.attacker.bondageItemsOnSelf()); //+2 difficulty per bondage item
            if(this.defender){
                scoreRequired -= (Constants.Fight.Action.Globals.difficultyIncreasePerBondageItem * this.defender.bondageItemsOnSelf()); //+2 difficulty per bondage item
                scoreRequired += Math.floor(this.defender.dexterity / 2);
                if(this.defender.focus < 0){
                    scoreRequired += Math.floor(this.defender.focus / 2);
                }
                if(this.defender.isStunned()){
                    scoreRequired -= 4;
                }
            }
            if(this.tier != -1){
                scoreRequired += TierDifficulty[Tier[this.tier]];
            }
        }
        if(scoreRequired < 0){
            scoreRequired = 0;
        }
        return scoreRequired;
    }

    triggerAction():Trigger{
        let result;
        switch (this.type) {
            case Action.Brawl:
                result = this.actionBrawl();
                break;
            case Action.Bondage:
                result = this.actionBondage();
                break;
            case Action.Degradation:
                result = this.actionDegradation();
                break;
            case Action.Escape:
                result = this.actionEscape();
                break;
            case Action.ForcedWorship:
                result = this.actionForcedWorship();
                break;
            case Action.HighRisk:
                result = this.actionHighRisk();
                break;
            case Action.HighRiskSex:
                result = this.actionHighRiskSex();
                break;
            case Action.HumHold:
                result = this.actionHumHold();
                break;
            case Action.ItemPickup:
                result = this.actionItemPickup();
                break;
            case Action.SexStrike:
                result = this.actionSexStrike();
                break;
            case Action.SubHold:
                result = this.actionSubHold();
                break;
            case Action.SexHold:
                result = this.actionSexHold();
                break;
            case Action.SextoyPickup:
                result = this.actionSextoyPickup();
                break;
            case Action.Rest:
                result = this.actionRest();
                break;
            case Action.Tag:
                result = this.actionTag();
                break;
            case Action.Stun:
                result = this.actionStun();
                break;
            case Action.Submit:
                result = this.actionSubmit();
                break;
            case Action.StrapToy:
                result = this.actionStrapToy();
                break;
            case Action.Finish:
                result = this.actionFinish();
                break;
            default:
                this.attacker.fight.message.addHit("WARNING! UNKNOWN ATTACK!");
                result = Trigger.None;
                break;
        }
        return result;
    }

    actionBrawl():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.BrawlAttack);
        this.diceScore = this.attacker.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += this.tier + 1;
            this.fpDamageToDef += this.tier + 1;
            this.hpDamageToDef += this.attackFormula(this.tier, this.attacker.power, this.defender.toughness, this.diceScore);
        }
        return Trigger.BrawlAttack;
    }

    actionSexStrike():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.SexStrikeAttack);
        this.diceScore = this.attacker.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += this.tier + 1;
            this.fpDamageToDef += this.tier + 1;
            this.lpDamageToDef += this.attackFormula(this.tier, this.attacker.sensuality, this.defender.endurance, this.diceScore);
        }
        return Trigger.SexStrikeAttack;
    }

    actionSubHold():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.SubmissionHold);
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += this.tier + 1;
            this.fpDamageToDef += this.tier + 1;
            let hpDamage = this.attackFormula(this.tier, this.attacker.power, this.defender.toughness, this.diceScore);
            let holdModifier = new HoldModifier(this.defender, this.attacker, this.tier, ModifierType.SubHold, hpDamage, 0, 0);
            let brawlBonusAttacker = new BrawlBonusSubHoldModifier(this.attacker, [holdModifier.id]);
            let brawlBonusDefender = new BrawlBonusSubHoldModifier(this.defender, [holdModifier.id]);
            this.modifiers.push(holdModifier);
            this.modifiers.push(brawlBonusAttacker);
            this.modifiers.push(brawlBonusDefender);
        }
        return Trigger.SubmissionHold;
    }

    actionSexHold():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.SexHoldAttack);
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += this.tier + 1;
            this.fpDamageToDef += this.tier + 1;
            let lustDamage = this.attackFormula(this.tier, this.attacker.sensuality, this.defender.endurance, this.diceScore);
            let holdModifier = new HoldModifier(this.defender, this.attacker, this.tier, ModifierType.SexHold, 0, lustDamage, 0);
            let lustBonusAttacker = new LustBonusSexHoldModifier(this.attacker, [holdModifier.id]);
            let lustBonusDefender = new LustBonusSexHoldModifier(this.defender, [holdModifier.id]);
            this.modifiers.push(holdModifier);
            this.modifiers.push(lustBonusAttacker);
            this.modifiers.push(lustBonusDefender);
        }
        return Trigger.SexHoldAttack;
    }

    actionHumHold():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.HumiliationHold);
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusDamageHum[Tier[this.tier]];
            let focusDamage = FocusDamageHum[Tier[this.tier]];
            let holdModifier = new HoldModifier(this.defender, this.attacker, this.tier, ModifierType.HumHold, 0, 0, focusDamage);
            this.modifiers.push(holdModifier);
        }
        return Trigger.HumiliationHold;
    }

    actionBondage():Trigger{ //No tier
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Bondage);
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.fpHealToAtk += 3;
        this.fpDamageToDef += 3;
        let bdModifier = new BondageModifier(this.defender, this.attacker);
        this.modifiers.push(bdModifier);
        return Trigger.Bondage;
    }

    actionHighRisk():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.HighRiskAttack);
        this.diceScore = this.attacker.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += this.tier + 1;
            this.fpDamageToDef += this.tier + 1;
            this.hpDamageToDef += Math.floor(this.attackFormula(this.tier, this.attacker.power, this.defender.toughness, this.diceScore) * HighRiskMultipliers[Tier[this.tier]]);
        }
        else{
            this.missed = true;
            this.fpDamageToAtk += this.tier + 1;
            this.fpHealToDef += this.tier + 1;
            this.hpDamageToAtk += Math.floor(this.attackFormula(this.tier, this.attacker.power, this.attacker.toughness, 0) * (1 + (1 - HighRiskMultipliers[Tier[this.tier]])));
        }
        return Trigger.HighRiskAttack;
    }

    actionHighRiskSex():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.HighRiskSexAttack);
        this.diceScore = this.attacker.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += this.tier + 1;
            this.fpDamageToDef += this.tier + 1;
            this.lpDamageToDef += Math.floor(this.attackFormula(this.tier, this.attacker.sensuality, this.defender.endurance, this.diceScore) * HighRiskMultipliers[Tier[this.tier]]);
        }
        else{
            this.missed = true;
            this.fpDamageToAtk += this.tier + 1;
            this.fpHealToDef += this.tier + 1;
            this.lpDamageToAtk += Math.floor(this.attackFormula(this.tier, this.attacker.sensuality, this.attacker.endurance, 0) * (1 + (1 - HighRiskMultipliers[Tier[this.tier]])));
        }
        return Trigger.HighRiskSexAttack;
    }

    actionForcedWorship():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.ForcedWorshipAttack);
        this.diceScore = this.attacker.roll(1) + this.attacker.sensuality;
        this.lpDamageToAtk += (this.tier+1) * 2; //deal damage anyway. They're gonna be exposed!
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusDamageHum[Tier[this.tier]];
            this.fpDamageToDef += FocusDamageHum[Tier[this.tier]];
            this.lpDamageToDef += 1;
        }
        return Trigger.ForcedWorshipAttack;
    }

    actionItemPickup():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.ItemPickup);
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.fpHealToAtk += 1;
        this.fpDamageToDef += 1;
        let itemPickupModifier = new ItemPickupModifier(this.attacker);
        this.modifiers.push(itemPickupModifier);
        return Trigger.ItemPickup;
    }

    actionSextoyPickup():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.SextoyPickup);
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.fpHealToAtk += 1;
        this.fpDamageToDef += 1;
        let itemPickupModifier = new SextoyPickupModifier(this.attacker);
        this.modifiers.push(itemPickupModifier);
        return Trigger.SextoyPickup;
    }

    actionDegradation():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Degradation);
        this.diceScore = this.attacker.roll(1) + this.attacker.sensuality;
        if(this.diceScore >= this.requiredDiceScore()) {
            this.missed = false;
            this.fpDamageToDef += FocusDamageHum[Tier[this.tier]] * 2;
            let humiliationModifier = new DegradationModifier(this.defender, this.attacker);
            this.modifiers.push(humiliationModifier);
        }
        return Trigger.Degradation;
    }

    actionTag():Trigger{ //"skips" a turn
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Tag);
        this.diceScore = this.attacker.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()) {
            this.attacker.lastTagTurn = this.atTurn;
            this.defender.lastTagTurn = this.atTurn;
            this.attacker.isInTheRing = false;
            this.defender.isInTheRing = true;
            this.missed = false;
        }
        return Trigger.Tag;
    }

    actionRest():Trigger{ //"skips" a turn
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Rest);
        this.defender = null;
        this.diceScore = this.attacker.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()) {
            this.missed = false;
            this.hpHealToAtk += this.attacker.hp * Constants.Fight.Action.Globals.hpPercentageToHealOnRest;
            this.lpHealToAtk += this.attacker.lust * Constants.Fight.Action.Globals.lpPercentageToHealOnRest;
            this.fpHealToAtk += this.attacker.focus * Constants.Fight.Action.Globals.fpPointsToHealOnRest;
        }
        return Trigger.Rest;
    }

    actionStun():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Stun);
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += this.tier + 1;
            this.fpDamageToDef += this.tier + 1;
            let nbOfAttacksStunned = this.tier + 1;
            this.hpDamageToDef = this.attackFormula(this.tier, Math.floor(this.attacker.power / Constants.Fight.Action.Globals.stunPowerDivider), this.defender.toughness, this.diceScore);
            let stunModifier = new StunModifier(this.defender, this.attacker, -((this.tier + 1) * Constants.Fight.Action.Globals.dicePenaltyMultiplierWhileStunned), nbOfAttacksStunned);
            this.modifiers.push(stunModifier);
            this.attacker.fight.message.addHit("STUNNED!");
        }
        return Trigger.Stun;
    }

    actionEscape():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Escape);
        this.defender = null;
        this.tier = this.attacker.isInHoldOfTier();
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.attacker.escapeHolds();
        }
        return Trigger.Escape;
    }

    actionSubmit():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Submit);
        this.requiresRoll = false;
        this.defender = null;
        this.attacker.triggerPermanentOutsideRing();
        this.attacker.fight.message.addHit(Utils.strFormat(Constants.Messages.tapoutMessage, [this.attacker.getStylizedName()]));
        return Trigger.Submit;
    }

    actionStrapToy():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.StrapToy);
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.sensuality;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += this.tier + 1;
            this.fpDamageToDef += this.tier + 1;
            let nbOfTurnsWearingToy = this.tier + 1;
            let lpDamage = StrapToyLPDamagePerTurn[Tier[this.tier]];
            let strapToyModifier = new StrapToyModifier(this.defender, nbOfTurnsWearingToy, lpDamage);
            this.modifiers.push(strapToyModifier);
            this.attacker.fight.message.addHit("The sextoy started vibrating!");
        }
        return Trigger.StrapToy;
    }

    actionFinish():Trigger{
        this.tier = Tier.Heavy;
        if(this.diceScore >= this.requiredDiceScore()){
            this.defender.triggerPermanentOutsideRing();
        }
        this.attacker.fight.message.addHit(Utils.strFormat(Constants.Messages.finishMessage, [this.attacker.getStylizedName()]));
        return Trigger.None;
    }

    static commitDb(action:FightAction){
        return new Promise<number>(function(resolve, reject) {
            let attackerId = action.attacker.id || null;
            let defenderId = null;
            if(action.defender){
                defenderId = action.defender.id;
            }
            var sql = Constants.SQL.commitFightAction;
            sql = Data.db.format(sql, [Constants.SQL.actionTableName, action.fightId, action.atTurn, action.type, action.tier, action.isHold, action.diceScore, action.missed, attackerId, defenderId, action.hpDamageToDef, action.lpDamageToDef, action.fpDamageToDef, action.hpDamageToAtk, action.lpDamageToAtk, action.fpDamageToAtk, action.hpHealToDef, action.lpHealToDef, action.fpHealToDef, action.hpHealToAtk, action.lpHealToAtk, action.fpHealToAtk]);
            Data.db.query(sql, (err, results) => {
                if (err) {
                    throw err;
                }
                else {
                    action.id = results.insertId;
                    resolve(results.insertId);
                }
            });
        });
    }

    commit(fight:Fight){
        if(this.defender){
            fight.message.addAction(`${Constants.Action[this.type]} on ${this.defender.getStylizedName()}`);
        }
        else{
            fight.message.addAction(`${Constants.Action[this.type]}`);
        }

        if(this.missed == false){
            if(this.requiresRoll == false){ //-1 == no roll
                fight.message.addHit(` ${Action[this.type]}! `);
            }
            else{
                fight.message.addHit(Constants.Messages.HitMessage);
            }
        }
        else{
            fight.message.addHit(` MISS! `);
        }

        if(this.requiresRoll){
            fight.message.addHint("Rolled: "+this.diceScore);
            fight.message.addHint(`Required roll: ${this.requiredDiceScore()}`);
        }

        //Features check
        if(this.attacker.hasFeature(Constants.FeatureType.Sadist)){
            this.lpDamageToAtk += Math.floor(this.hpDamageToDef / 2);
        }
        if(this.attacker.hasFeature(Constants.FeatureType.CumSlut)){
            if(this.lpDamageToAtk > 0){
                this.lpDamageToAtk += 3;
            }
        }
        if(this.attacker.hasFeature(Constants.FeatureType.RyonaEnthusiast)){
            if(this.hpDamageToAtk > 0){
                this.lpDamageToAtk += Math.floor(this.hpDamageToAtk / 2);
            }
        }

        //Defender
        if(this.defender){
            if(this.defender.hasFeature(Constants.FeatureType.Sadist)){
                this.lpDamageToDef += Math.floor(this.hpDamageToAtk / 2);
            }
            if(this.defender.hasFeature(Constants.FeatureType.CumSlut)){
                if(this.lpDamageToDef > 0){
                    this.lpDamageToDef += 3;
                }
            }
            if(this.defender.hasFeature(Constants.FeatureType.RyonaEnthusiast)){
                if(this.hpDamageToDef > 0){
                    this.lpDamageToDef += Math.floor(this.hpDamageToDef / 2);
                }
            }
        }




        fight.pastActions.push(this);

        if (this.hpDamageToDef > 0) {
            this.defender.hitHP(this.hpDamageToDef);
            this.defender.fight.message.HPDamageDef = this.hpDamageToDef;
        }
        if (this.lpDamageToDef > 0) {
            this.defender.hitLP(this.lpDamageToDef);
            this.defender.fight.message.LPDamageDef = this.lpDamageToDef;
        }
        if(this.fpDamageToDef > 0){
            this.defender.hitFP(this.fpDamageToDef);
            this.defender.fight.message.FPDamageDef = this.fpDamageToDef;
        }
        if (this.hpHealToDef > 0) {
            this.defender.healHP(this.hpHealToDef);
            this.defender.fight.message.HPHealDef = this.hpHealToDef;
        }
        if (this.lpHealToDef > 0) {
            this.defender.healLP(this.lpHealToDef);
            this.defender.fight.message.LPHealDef = this.lpHealToDef;
        }
        if(this.fpHealToDef > 0){
            this.defender.healFP(this.fpHealToDef);
            this.defender.fight.message.FPHealDef = this.fpHealToDef;
        }


        if (this.hpDamageToAtk > 0) {
            this.attacker.hitHP(this.hpDamageToAtk);
            this.attacker.fight.message.HPDamageAtk = this.hpDamageToAtk;
        }
        if (this.lpDamageToAtk > 0) {
            this.attacker.hitLP(this.lpDamageToAtk);
            this.attacker.fight.message.LPDamageAtk = this.lpDamageToAtk;
        }
        if(this.fpDamageToAtk > 0){
            this.attacker.hitFP(this.fpDamageToAtk);
            this.attacker.fight.message.FPDamageAtk = this.fpDamageToAtk;
        }
        if (this.hpHealToAtk > 0) {
            this.attacker.healHP(this.hpHealToAtk);
            this.attacker.fight.message.HPHealAtk = this.hpHealToAtk;
        }
        if (this.lpHealToAtk > 0) {
            this.attacker.healLP(this.lpHealToAtk);
            this.attacker.fight.message.LPHealAtk = this.lpHealToAtk;
        }
        if(this.fpHealToAtk > 0){
            this.attacker.healFP(this.fpHealToAtk);
            this.attacker.fight.message.FPHealAtk = this.fpHealToAtk;
        }


        if(this.modifiers.length > 0){
            if(this.type == Action.SubHold || this.type == Action.SexHold || this.type == Action.HumHold){ //for any holds, do the stacking here
                let indexOfNewHold = this.modifiers.findIndex(x => x.name == Constants.Modifier.SubHold || x.name == Constants.Modifier.SexHold || x.name == Constants.Modifier.HumHold);
                let indexOfAlreadyExistantHoldForDefender = this.defender.modifiers.findIndex(x => x.name == Constants.Modifier.SubHold || x.name == Constants.Modifier.SexHold || x.name == Constants.Modifier.HumHold);
                if(indexOfAlreadyExistantHoldForDefender != -1){
                    let idOfFormerHold = this.defender.modifiers[indexOfAlreadyExistantHoldForDefender].id;
                    for(let mod of this.defender.modifiers){
                        //we updated the children and parent's damage and turns
                        if(mod.id == idOfFormerHold){
                            mod.name = this.modifiers[indexOfNewHold].name;
                            mod.event = this.modifiers[indexOfNewHold].event;
                            mod.uses += this.modifiers[indexOfNewHold].uses;
                            mod.hpDamage += this.modifiers[indexOfNewHold].hpDamage;
                            mod.lustDamage += this.modifiers[indexOfNewHold].lustDamage;
                            mod.focusDamage += this.modifiers[indexOfNewHold].focusDamage;
                            //Did not add the dice/escape score modifications, if needed, implement here
                        }
                        else if(mod.parentIds && mod.parentIds.indexOf(idOfFormerHold) != -1){
                            mod.uses += this.modifiers[indexOfNewHold].uses;
                        }
                    }
                    for(let mod of this.attacker.modifiers){
                        //update the bonus modifiers length
                        if(mod.parentIds.indexOf(idOfFormerHold) != -1){
                            mod.uses += this.modifiers[indexOfNewHold].uses;
                        }
                    }
                    fight.message.addInfo(`[b][color=red]Hold Stacking![/color][/b] ${this.defender.name} will have to suffer this hold for ${this.modifiers[indexOfNewHold].uses} more turns, and will also suffer a bit more!\n
                                     ${(this.modifiers[indexOfNewHold].hpDamage > 0 ? "Added -"+this.modifiers[indexOfNewHold].hpDamage+" HP per turn\n":"")}
                                     ${(this.modifiers[indexOfNewHold].lustDamage > 0 ? "Added +"+this.modifiers[indexOfNewHold].lustDamage+" Lust per turn\n":"")}
                                     ${(this.modifiers[indexOfNewHold].focusDamage > 0 ? "Added "+this.modifiers[indexOfNewHold].focusDamage+" Focus per turn\n":"")}
                     `);
                }
                else{
                    for(let mod of this.modifiers){
                        if(mod.receiver == this.defender){
                            this.defender.modifiers.push(mod);
                        }
                        else if(mod.receiver == this.attacker){
                            this.attacker.modifiers.push(mod);
                        }
                    }
                }
            }
            else{
                for(let mod of this.modifiers){
                    if(mod.receiver == this.attacker){
                        this.attacker.modifiers.push(mod);
                    }
                    else if(mod.receiver == this.defender){
                        this.defender.modifiers.push(mod);
                    }
                }
            }
        }

        if(this.missed == false && this.type == Action.Tag){
            fight.message.addHit(`[b][color=red]TAG![/color][/b] ${this.defender.name} enters inside the ring!`);
        }
        else if(this.defender){
            if (this.defender.isDead()) {
                fight.message.addHit(`${this.defender.name} couldn't take the hits anymore! [b][color=red]They're out![/color][/b]`);
                this.defender.triggerPermanentOutsideRing();
            }
            else if (this.defender.isSexuallyExhausted()) {
                fight.message.addHit(`${this.defender.name} is too sexually exhausted to continue! [b][color=red]They're out![/color][/b]`);
                this.defender.triggerPermanentOutsideRing();
            }
            else if (this.defender.isBroken()) {
                fight.message.addHit(`${this.defender.name} is too mentally exhausted to continue! [b][color=red]They're out![/color][/b]`);
                this.defender.triggerPermanentOutsideRing();
            }
            else if (this.defender.isCompletelyBound()) {
                fight.message.addHit(`${this.defender.name} has too many items on them to possibly fight! [b][color=red]They're out![/color][/b]`);
                this.defender.triggerPermanentOutsideRing();
            }
            else if (!this.defender.isInTheRing) {
                fight.message.addHit(`${this.defender.name} can't stay inside the ring anymore! [b][color=red]They're out![/color][/b]`);
            }
        }

        //Save it to the DB
        FightAction.commitDb(this);

        //check for fight ending status
        if(this.type == Action.Escape && this.missed == false){
            fight.message.addHint(`This is still your turn ${this.attacker.getStylizedName()}, time to fight back!`);
            fight.sendMessage();
            fight.waitingForAction = true;
        } else if (!fight.isFightOver()) {
            fight.nextTurn();
        } else { //if there's only one team left in the fight, then we're sure it's over
            fight.outputStatus();
            var tokensToGiveToWinners:number = TokensPerWin[FightTier[fight.getFightTier(fight.winnerTeam)]];
            var tokensToGiveToLosers:number = tokensToGiveToWinners*Constants.Fight.Globals.tokensPerLossMultiplier;
            fight.endFight(tokensToGiveToWinners, tokensToGiveToLosers);
        }
    }
}