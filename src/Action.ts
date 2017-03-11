import * as Constants from "./Constants";
import Tier = Constants.Tier;
import BaseDamage = Constants.BaseDamage;
import {Fight} from "./Fight";
import TierDifficulty = Constants.TierDifficulty;
import Trigger = Constants.Trigger;
import TokensPerWin = Constants.TokensPerWin;
import FightTier = Constants.FightTier;
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
import {Modifier} from "./Modifier";
import {ActiveFighter} from "./ActiveFighter";
import {Model} from "./Model";
import {ActionRepository} from "./ActionRepository";
import {FocusDamageOnMiss} from "./Constants";
import {FocusHealOnHit} from "./Constants";
import {FocusDamageOnHit} from "./Constants";

export class Action{

    idAction: string;
    fight:Fight;
    idFight;
    atTurn: number;
    type:ActionType;
    tier: Tier;
    isHold: boolean = false;
    diceScore: number = -1;
    missed: boolean = true;
    idAttacker:string;
    idDefender:string;
    attacker:ActiveFighter;
    defender:ActiveFighter;
    hpDamageToDef: number = 0;
    lpDamageToDef: number = 0;
    fpDamageToDef: number = 0;
    hpDamageToAtk: number = 0;
    lpDamageToAtk: number = 0;
    fpDamageToAtk: number = 0;
    hpHealToDef: number = 0;
    lpHealToDef: number = 0;
    fpHealToDef: number = 0;
    hpHealToAtk: number = 0;
    lpHealToAtk: number = 0;
    fpHealToAtk: number = 0;
    requiresRoll: boolean = true;
    createdAt:Date;
    updatedAt:Date;

    modifiers:Modifier[] = [];

    constructor(idFight:string, currentTurn:number, actionType:ActionType, tier:Tier, attacker:string, defender?:string){
        this.idAction = Utils.generateUUID();
        this.idFight = idFight;
        this.atTurn = currentTurn;
        this.type = actionType;
        this.tier = tier;
        this.idAttacker = attacker;
        this.idDefender = defender;
        this.createdAt = new Date();
    }

    buildAction(fight:Fight, attacker:ActiveFighter, defender?:ActiveFighter) {
        this.fight = fight;
        this.idFight = fight.idFight;
        this.attacker = attacker;
        this.idAttacker = attacker.name;
        this.defender = defender;
        this.idDefender = defender.name;
        this.createdAt = new Date();
    }

    attackFormula(tier:Tier, actorAtk:number, targetDef:number, roll:number):number{
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

    requiredDiceScore():number{
        let scoreRequired = 0;
        if (this.type == ActionType.Rest) {
            scoreRequired = Constants.Fight.Action.RequiredScore.Rest;
        }
        else if (this.type == ActionType.Tag) {
            scoreRequired = Constants.Fight.Action.RequiredScore.Tag;
        }
        else{
            if (this.type == ActionType.Finish) {
                scoreRequired += 6;
            }

            scoreRequired += (Constants.Fight.Action.Globals.difficultyIncreasePerBondageItem * this.attacker.bondageItemsOnSelf()); //+2 difficulty per bondage item

            if(this.defender){
                scoreRequired -= (Constants.Fight.Action.Globals.difficultyIncreasePerBondageItem * this.defender.bondageItemsOnSelf()); //+2 difficulty per bondage item
                scoreRequired += Math.floor(this.defender.currentDexterity / 20);

                if(this.defender.focus < 0){
                    scoreRequired += Math.floor(this.defender.focus / 20);
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
            case ActionType.Brawl:
                result = this.actionBrawl();
                break;
            case ActionType.Bondage:
                result = this.actionBondage();
                break;
            case ActionType.Degradation:
                result = this.actionDegradation();
                break;
            case ActionType.Escape:
                result = this.actionEscape();
                break;
            case ActionType.ForcedWorship:
                result = this.actionForcedWorship();
                break;
            case ActionType.HighRisk:
                result = this.actionHighRisk();
                break;
            case ActionType.Penetration:
                result = this.actionPenetration();
                break;
            case ActionType.HumHold:
                result = this.actionHumHold();
                break;
            case ActionType.ItemPickup:
                result = this.actionItemPickup();
                break;
            case ActionType.SexStrike:
                result = this.actionSexStrike();
                break;
            case ActionType.SubHold:
                result = this.actionSubHold();
                break;
            case ActionType.SexHold:
                result = this.actionSexHold();
                break;
            case ActionType.SextoyPickup:
                result = this.actionSextoyPickup();
                break;
            case ActionType.Rest:
                result = this.actionRest();
                break;
            case ActionType.Tag:
                result = this.actionTag();
                break;
            case ActionType.Stun:
                result = this.actionStun();
                break;
            case ActionType.Submit:
                result = this.actionSubmit();
                break;
            case ActionType.StrapToy:
                result = this.actionStrapToy();
                break;
            case ActionType.Finish:
                result = this.actionFinisher();
                break;
            case ActionType.Masturbate:
                result = this.actionMasturbate();
                break;
            default:
                this.fight.message.addHit("WARNING! UNKNOWN ATTACK!");
                result = Trigger.None;
                break;
        }
        return result;
    }

    actionBrawl():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.BrawlAttack);
        this.diceScore = this.attacker.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            this.fpDamageToDef += FocusDamageOnHit[Tier[this.tier]];
            this.hpDamageToDef += this.attackFormula(this.tier, this.attacker.currentPower, this.defender.currentToughness, this.diceScore);
        }
        return Trigger.BrawlAttack;
    }

    actionSexStrike():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.SexStrikeAttack);
        this.diceScore = this.attacker.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            this.fpDamageToDef += FocusDamageOnHit[Tier[this.tier]];
            this.lpDamageToDef += this.attackFormula(this.tier, this.attacker.currentSensuality, this.defender.currentEndurance, this.diceScore);
        }
        return Trigger.SexStrikeAttack;
    }

    actionSubHold():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.SubmissionHold);
        this.diceScore = this.attacker.dice.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            this.fpDamageToDef += FocusDamageOnHit[Tier[this.tier]];
            let hpDamage = this.attackFormula(this.tier, this.attacker.currentPower, this.defender.currentToughness, this.diceScore);
            let holdModifier = new HoldModifier(this.defender, this.attacker, this.tier, ModifierType.SubHold, hpDamage, 0, 0);
            let brawlBonusAttacker = new BrawlBonusSubHoldModifier(this.attacker, [holdModifier.idModifier]);
            let brawlBonusDefender = new BrawlBonusSubHoldModifier(this.defender, [holdModifier.idModifier]);
            this.modifiers.push(holdModifier);
            this.modifiers.push(brawlBonusAttacker);
            this.modifiers.push(brawlBonusDefender);
        }
        return Trigger.SubmissionHold;
    }

    actionSexHold():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.SexHoldAttack);
        this.diceScore = this.attacker.dice.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            this.fpDamageToDef += FocusDamageOnHit[Tier[this.tier]];
            let lustDamage = this.attackFormula(this.tier, this.attacker.currentSensuality, this.defender.currentEndurance, this.diceScore);
            let holdModifier = new HoldModifier(this.defender, this.attacker, this.tier, ModifierType.SexHold, 0, lustDamage, 0);
            let lustBonusAttacker = new LustBonusSexHoldModifier(this.attacker, [holdModifier.idModifier]);
            let lustBonusDefender = new LustBonusSexHoldModifier(this.defender, [holdModifier.idModifier]);
            this.modifiers.push(holdModifier);
            this.modifiers.push(lustBonusAttacker);
            this.modifiers.push(lustBonusDefender);
        }
        return Trigger.SexHoldAttack;
    }

    actionHumHold():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.HumiliationHold);
        this.diceScore = this.attacker.dice.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            let focusDamage = FocusDamageOnHit[Tier[this.tier]];
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
        this.fpHealToAtk += FocusHealOnHit[Tier[Tier.Heavy]];
        this.fpDamageToDef += FocusDamageOnHit[Tier[Tier.Heavy]];
        let bdModifier = new BondageModifier(this.defender, this.attacker);
        this.modifiers.push(bdModifier);
        return Trigger.Bondage;
    }

    actionHighRisk():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.HighRiskAttack);
        this.diceScore = this.attacker.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            this.fpDamageToDef += FocusDamageOnHit[Tier[this.tier]];
            this.hpDamageToDef += Math.floor(this.attackFormula(this.tier, this.attacker.currentPower, this.defender.currentToughness, this.diceScore) * HighRiskMultipliers[Tier[this.tier]]);
        }
        else{
            this.missed = true;
            this.fpDamageToAtk += FocusDamageOnHit[Tier[this.tier]];
            this.fpHealToDef += FocusHealOnHit[Tier[this.tier]];
            this.hpDamageToAtk += Math.floor(this.attackFormula(this.tier, this.attacker.currentPower, this.attacker.currentToughness, 0) * (1 + (1 - HighRiskMultipliers[Tier[this.tier]])));
        }
        return Trigger.HighRiskAttack;
    }

    actionPenetration():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Penetration);
        this.diceScore = this.attacker.roll(1) + Math.ceil(this.attacker.currentSensuality / 10);
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            this.fpDamageToDef += FocusDamageOnHit[Tier[this.tier]];
            this.lpDamageToDef += Math.floor(this.attackFormula(this.tier, this.attacker.currentSensuality, this.defender.currentEndurance, this.diceScore) * HighRiskMultipliers[Tier[this.tier]]);
        }
        else{
            this.missed = true;
            this.fpDamageToAtk += FocusDamageOnHit[Tier[this.tier]];
            this.fpHealToDef += FocusHealOnHit[Tier[this.tier]];
            this.lpDamageToAtk += Math.floor(this.attackFormula(this.tier, this.attacker.currentSensuality, this.attacker.currentEndurance, 0) * (1 + (1 - HighRiskMultipliers[Tier[this.tier]])));
        }
        return Trigger.Penetration;
    }

    actionForcedWorship():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.ForcedWorshipAttack);
        this.diceScore = this.attacker.roll(1) + Math.ceil(this.attacker.currentSensuality / 10);
        this.lpDamageToAtk += (this.tier+1) * 2; //deal damage anyway. They're gonna be exposed!
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            this.fpDamageToDef += FocusDamageOnHit[Tier[this.tier]];
            this.lpDamageToDef += 1;
        }
        return Trigger.ForcedWorshipAttack;
    }

    actionItemPickup():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.ItemPickup);
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.fpHealToAtk += FocusHealOnHit[Tier[Tier.Light]];
        this.fpDamageToDef += FocusDamageOnHit[Tier[Tier.Light]];
        let itemPickupModifier = new ItemPickupModifier(this.attacker);
        this.modifiers.push(itemPickupModifier);
        return Trigger.ItemPickup;
    }

    actionSextoyPickup():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.SextoyPickup);
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.fpHealToAtk += FocusHealOnHit[Tier[Tier.Light]];
        this.fpDamageToDef += FocusDamageOnHit[Tier[Tier.Light]];
        let itemPickupModifier = new SextoyPickupModifier(this.attacker);
        this.modifiers.push(itemPickupModifier);
        return Trigger.SextoyPickup;
    }

    actionDegradation():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Degradation);
        this.diceScore = this.attacker.roll(1) + Math.ceil(this.attacker.currentSensuality / 10);
        if(this.diceScore >= this.requiredDiceScore()) {
            this.missed = false;
            this.fpDamageToDef += FocusDamageOnHit[Tier[this.tier]] * Constants.Fight.Action.Globals.degradationFocusMultiplier;
            let humiliationModifier = new DegradationModifier(this.defender, this.attacker);
            this.modifiers.push(humiliationModifier);
        }
        return Trigger.Degradation;
    }

    actionTag():Trigger{ //"skips" a turn
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Tag);
        this.diceScore = this.attacker.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
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
        this.diceScore = this.attacker.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
        if(this.diceScore >= this.requiredDiceScore()) {
            this.missed = false;
            this.hpHealToAtk += this.attacker.hpPerHeart() * Constants.Fight.Action.Globals.hpPercentageToHealOnRest;
            this.lpHealToAtk += this.attacker.lustPerOrgasm() * Constants.Fight.Action.Globals.lpPercentageToHealOnRest;
            this.fpHealToAtk += this.attacker.maxFocus() * Constants.Fight.Action.Globals.fpPointsToHealOnRest;
        }
        return Trigger.Rest;
    }

    actionStun():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Stun);
        this.diceScore = this.attacker.dice.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            this.fpDamageToDef += this.tier + 1;
            let nbOfAttacksStunned = this.tier + 1;
            this.hpDamageToDef = this.attackFormula(this.tier, Math.floor(this.attacker.currentPower / Constants.Fight.Action.Globals.stunPowerDivider), this.defender.currentToughness, this.diceScore);
            let stunModifier = new StunModifier(this.defender, this.attacker, -((this.tier + 1) * Constants.Fight.Action.Globals.dicePenaltyMultiplierWhileStunned), nbOfAttacksStunned);
            this.modifiers.push(stunModifier);
            this.fight.message.addHit("STUNNED!");
        }
        return Trigger.Stun;
    }

    actionEscape():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Escape);
        this.defender = null;
        this.tier = this.attacker.isInHoldOfTier();
        this.diceScore = this.attacker.dice.roll(1) + Math.ceil(this.attacker.currentDexterity / 10);
        if(this.attacker.isInHold()){
            if(this.diceScore >= this.requiredDiceScore()){
                this.missed = false;
                this.attacker.escapeHolds();
            }
        }
        else{
            this.missed = false;
            this.fight.message.addHit(`${this.attacker.getStylizedName()} took some more distance... just in case!`);
        }

        return Trigger.Escape;
    }

    actionSubmit():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Submit);
        this.requiresRoll = false;
        this.missed = false;
        this.defender = null;
        this.attacker.triggerPermanentOutsideRing();
        this.fight.message.addHit(Utils.strFormat(Constants.Messages.tapoutMessage, [this.attacker.getStylizedName()]));
        return Trigger.Submit;
    }

    actionStrapToy():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.StrapToy);
        this.diceScore = this.attacker.dice.roll(1) + Math.ceil(this.attacker.currentSensuality / 10);
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += FocusHealOnHit[Tier[this.tier]];
            this.fpDamageToDef += this.tier + 1;
            let nbOfTurnsWearingToy = this.tier + 1;
            let lpDamage = StrapToyLPDamagePerTurn[Tier[this.tier]];
            let strapToyModifier = new StrapToyModifier(this.defender, nbOfTurnsWearingToy, lpDamage);
            this.modifiers.push(strapToyModifier);
            this.fight.message.addHit("The sextoy started vibrating!");
        }
        return Trigger.StrapToy;
    }

    actionFinisher():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Finisher);
        this.tier = Tier.Heavy;
        this.requiresRoll = false; //subject to change
        if((this.defender.heartsRemaining <= 1 || this.defender.orgasmsRemaining <= 1 || this.defender.consecutiveTurnsWithoutFocus == Constants.Fight.Action.Globals.maxTurnsWithoutFocus - 1) && this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.defender.triggerPermanentOutsideRing();
            this.fight.message.addHit(Utils.strFormat(Constants.Messages.finishMessage, [this.defender.getStylizedName()]));
        }
        else{
            this.missed = true;
            this.fight.message.addHit(Utils.strFormat(Constants.Messages.finishFailMessage, [this.attacker.getStylizedName()]));
        }

        return Trigger.Finisher;
    }

    actionMasturbate():Trigger{
        this.defender = null;
        this.requiresRoll = false;
        this.missed = false;
        this.lpDamageToAtk = 3;
        return Trigger.PassiveAction;
    }

    async commit(fight:Fight){
        let strTier = "";
        if(this.tier >= 0){
            strTier = Tier[this.tier];
        }

        if(this.defender){
            fight.message.addAction(`${strTier} ${ActionType[this.type]} on ${this.defender.getStylizedName()}`);
        }
        else{
            fight.message.addAction(`${strTier} ${ActionType[this.type]}`);
        }

        if(this.missed == false){
            let strActionType = ActionType[this.type];
            let explanation = ActionExplanation[strActionType];
            if(explanation != null){
                fight.message.addHit(Utils.strFormat(explanation, [this.attacker.getStylizedName()]));
            }
            else{
                fight.message.addHit(Constants.Messages.HitMessage);
            }
        }
        else{
            fight.message.addHit(` MISS! `);
            this.attacker.hitFP(FocusDamageOnMiss[Tier[this.tier]]);
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
            this.fight.message.HPDamageDef = this.hpDamageToDef;
        }
        if (this.lpDamageToDef > 0) {
            this.defender.hitLP(this.lpDamageToDef);
            this.fight.message.LPDamageDef = this.lpDamageToDef;
        }
        if(this.fpDamageToDef > 0){
            this.defender.hitFP(this.fpDamageToDef);
            this.fight.message.FPDamageDef = this.fpDamageToDef;
        }
        if (this.hpHealToDef > 0) {
            this.defender.healHP(this.hpHealToDef);
            this.fight.message.HPHealDef = this.hpHealToDef;
        }
        if (this.lpHealToDef > 0) {
            this.defender.healLP(this.lpHealToDef);
            this.fight.message.LPHealDef = this.lpHealToDef;
        }
        if(this.fpHealToDef > 0){
            this.defender.healFP(this.fpHealToDef);
            this.fight.message.FPHealDef = this.fpHealToDef;
        }


        if (this.hpDamageToAtk > 0) {
            this.attacker.hitHP(this.hpDamageToAtk);
            this.fight.message.HPDamageAtk = this.hpDamageToAtk;
        }
        if (this.lpDamageToAtk > 0) {
            this.attacker.hitLP(this.lpDamageToAtk);
            this.fight.message.LPDamageAtk = this.lpDamageToAtk;
        }
        if(this.fpDamageToAtk > 0){
            this.attacker.hitFP(this.fpDamageToAtk);
            this.fight.message.FPDamageAtk = this.fpDamageToAtk;
        }
        if (this.hpHealToAtk > 0) {
            this.attacker.healHP(this.hpHealToAtk);
            this.fight.message.HPHealAtk = this.hpHealToAtk;
        }
        if (this.lpHealToAtk > 0) {
            this.attacker.healLP(this.lpHealToAtk);
            this.fight.message.LPHealAtk = this.lpHealToAtk;
        }
        if(this.fpHealToAtk > 0){
            this.attacker.healFP(this.fpHealToAtk);
            this.fight.message.FPHealAtk = this.fpHealToAtk;
        }


        if(this.modifiers.length > 0){
            if (this.type == ActionType.SubHold || this.type == ActionType.SexHold || this.type == ActionType.HumHold) { //for any holds, do the stacking here
                let indexOfNewHold = this.modifiers.findIndex(x => x.name == Constants.Modifier.SubHold || x.name == Constants.Modifier.SexHold || x.name == Constants.Modifier.HumHold);
                let indexOfAlreadyExistantHoldForDefender = this.defender.modifiers.findIndex(x => x.name == Constants.Modifier.SubHold || x.name == Constants.Modifier.SexHold || x.name == Constants.Modifier.HumHold);
                if(indexOfAlreadyExistantHoldForDefender != -1){
                    let idOfFormerHold = this.defender.modifiers[indexOfAlreadyExistantHoldForDefender].idModifier;
                    for(let mod of this.defender.modifiers){
                        //we updated the children and parent's damage and turns
                        if(mod.idModifier == idOfFormerHold){
                            mod.name = this.modifiers[indexOfNewHold].name;
                            mod.event = this.modifiers[indexOfNewHold].event;
                            mod.uses += this.modifiers[indexOfNewHold].uses;
                            mod.hpDamage += this.modifiers[indexOfNewHold].hpDamage;
                            mod.lustDamage += this.modifiers[indexOfNewHold].lustDamage;
                            mod.focusDamage += this.modifiers[indexOfNewHold].focusDamage;
                            //Did not add the dice/escape score modifications, if needed, implement here
                        }
                        else if(mod.idParentActions && mod.idParentActions.indexOf(idOfFormerHold) != -1){
                            mod.uses += this.modifiers[indexOfNewHold].uses;
                        }
                    }
                    for(let mod of this.attacker.modifiers){
                        //update the bonus modifiers length
                        if(mod.idParentActions.indexOf(idOfFormerHold) != -1){
                            mod.uses += this.modifiers[indexOfNewHold].uses;
                        }
                    }
                    fight.message.addSpecial(`[b][color=red]Hold Stacking![/color][/b] ${this.defender.name} will have to suffer this hold for ${this.modifiers[indexOfNewHold].uses} more turns, and will also suffer a bit more, as it 
                                     ${(this.modifiers[indexOfNewHold].hpDamage > 0 ? "added -"+this.modifiers[indexOfNewHold].hpDamage+" HP per turn ":"")}
                                     ${(this.modifiers[indexOfNewHold].lustDamage > 0 ? "added +"+this.modifiers[indexOfNewHold].lustDamage+" Lust per turn ":"")}
                                     ${(this.modifiers[indexOfNewHold].focusDamage > 0 ? "added -"+this.modifiers[indexOfNewHold].focusDamage+" Focus per turn":"")}
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

        if(this.defender){
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
        await ActionRepository.persist(this);

        //check for fight ending status
        if (this.type == ActionType.Escape && this.missed == false) {
            fight.message.addHint(`This is still your turn ${this.attacker.getStylizedName()}, time to fight back!`);
            fight.message.send();
            fight.waitingForAction = true;
        } else if (!fight.isOver()) {
            fight.nextTurn();
        } else { //if there's only one team left in the fight, then we're sure it's over
            fight.outputStatus();
            let tokensToGiveToWinners:number = TokensPerWin[FightTier[fight.getFightTier(fight.winnerTeam)]];
            let tokensToGiveToLosers:number = tokensToGiveToWinners*Constants.Fight.Globals.tokensPerLossMultiplier;
            fight.endFight(tokensToGiveToWinners, tokensToGiveToLosers);
        }
    }

}

export class EmptyAction extends Action {
    constructor() {
        super("", 0, 0, 0, "", null);
    }
}


export enum ActionType {
    Brawl,
    SexStrike,
    Tag,
    Rest,
    SubHold,
    SexHold,
    Bondage,
    HumHold,
    ItemPickup,
    SextoyPickup,
    Degradation,
    ForcedWorship,
    HighRisk,
    Penetration,
    Stun,
    Escape,
    Submit,
    StrapToy,
    Finish,
    Masturbate
}

export class ActionExplanation {
    static Tag = `[b][color=red]TAG![/color][/b] %s heads out of the ring!`;
    static Rest = `[b][color=red]%s rests for a bit![/color][/b]`;
    static Bondage = `[b][color=red]%s just tied up their opponent a little bit more![/color][/b]`;
    static ItemPickup = `[b][color=red]%s's picked up item looks like it could it hit hard![/color][/b]`;
    static SextoyPickup = `[b][color=red]%s is going to have a lot of fun with this sex-toy![/color][/b]`;
    static Escape = `[b][color=red]%s got away![/color][/b]`;
    static Submit = `[b][color=red]%s taps out! It's over, it's done![/color][/b]`;
    static Masturbate = `[b][color=red]%s really needed those strokes apparently![/color][/b]`;
}