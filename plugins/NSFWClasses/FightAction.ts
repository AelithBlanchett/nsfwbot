import {Fighter} from "./Fighter";
import {Constants} from "./Constants";
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
        return BaseDamage[Tier[tier]]-(actorAtk-targetDef)+(Math.floor(roll/2));
    }

    requiredDiceScore():number{
        let scoreRequired = 0;
        scoreRequired += (Constants.difficultyIncreasePerBondageItem * this.attacker.bondageItemsOnSelf()); //+2 difficulty per bondage item
        scoreRequired -= this.attacker.dexterity;
        if(this.defender){
            scoreRequired -= (Constants.difficultyIncreasePerBondageItem * this.defender.bondageItemsOnSelf()); //+2 difficulty per bondage item
            scoreRequired += Math.floor(this.defender.dexterity*1.75);
        }
        scoreRequired += TierDifficulty[Tier[this.tier]];
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
            case Action.Tackle:
                result = this.actionTackle();
                break;
            default:
                this.attacker.fight.message.addInfo("WARNING! UNKNOWN ATTACK!");
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
            let holdModifier = new HoldModifier(this.defender, this.attacker, ModifierType.SubHold, hpDamage, 0, 0);
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
            let holdModifier = new HoldModifier(this.defender, this.attacker, ModifierType.SexHold, 0, lustDamage, 0);
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
            let holdModifier = new HoldModifier(this.defender, this.attacker, ModifierType.HumHold, 0, 0, focusDamage);
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
            this.hpDamageToDef += this.attackFormula(this.tier, this.attacker.power * Constants.multiplierHighRiskAttack, this.defender.toughness, this.diceScore);
        }
        else{
            this.missed = true;
            this.fpDamageToAtk += this.tier + 1;
            this.fpHealToDef += this.tier + 1;
            this.hpDamageToAtk += this.attackFormula(this.tier, this.attacker.power, this.defender.toughness, 0);
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
            this.lpDamageToDef += this.attackFormula(this.tier, this.attacker.sensuality * Constants.multiplierHighRiskAttack, this.defender.endurance, this.diceScore);
        }
        else{
            this.missed = true;
            this.fpDamageToAtk += this.tier + 1;
            this.fpHealToDef += this.tier + 1;
            this.lpDamageToAtk += this.attackFormula(this.tier, this.attacker.sensuality, this.defender.endurance, 0);
        }
        return Trigger.HighRiskSexAttack;
    }

    actionForcedWorship():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.ForcedWorshipAttack);
        this.diceScore = this.attacker.roll(1) + this.attacker.sensuality;
        this.lpDamageToAtk += (this.tier+1) * 2; //deal damage anyway. They're gonna be exposed!
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
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
        if(this.diceScore >= Constants.requiredScoreToTag) {
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
        this.diceScore = this.attacker.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= Constants.requiredScoreToRest) {
            this.missed = false;
            this.hpHealToAtk += this.attacker.hp * Constants.hpPercantageToHealOnRest;
            this.lpHealToAtk += this.attacker.hp * Constants.lpPercantageToHealOnRest;
            this.fpHealToAtk += this.attacker.hp * Constants.fpPointsToHealOnRest;
        }
        return Trigger.Rest;
    }

    actionTackle():Trigger{
        this.attacker.triggerMods(TriggerMoment.Before, Trigger.Tackle);
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.dexterity;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.fpHealToAtk += this.tier + 1;
            this.fpDamageToDef += this.tier + 1;
            let nbOfAttacksStunned = this.tier + 1;
            this.hpDamageToDef = this.attackFormula(this.tier, Math.floor(this.attacker.power / Constants.tacklePowerDivider), this.defender.toughness, this.diceScore);
            let stunModifier = new StunModifier(this.defender, this.attacker, -((this.tier + 1) * Constants.dicePenaltyMultiplierWhileStunned), nbOfAttacksStunned);
            this.modifiers.push(stunModifier);
            this.attacker.fight.message.addHit("STUNNED!");
        }
        return Trigger.Tackle;
    }

    static commitDb(action:FightAction){
        return new Promise<number>(function(resolve, reject) {
            let attackerId = action.attacker.id || null;
            let defenderId = null;
            if(action.defender){
                defenderId = action.defender.id;
            }
            var sql = Constants.SQL.commitFightAction;
            sql = Data.db.format(sql, [Constants.actionTableName, action.fightId, action.atTurn, action.type, action.tier, action.isHold, action.diceScore, action.missed, attackerId, defenderId, action.hpDamageToDef, action.lpDamageToDef, action.fpDamageToDef, action.hpDamageToAtk, action.lpDamageToAtk, action.fpDamageToAtk, action.hpHealToDef, action.lpHealToDef, action.fpHealToDef, action.hpHealToAtk, action.lpHealToAtk, action.fpHealToAtk]);
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
        fight.message.addInfo("\n");
        if(this.missed == false){
            if(this.requiresRoll == false){ //-1 == no roll
                fight.message.addInfo(`The ${Action[this.type]} is [b][color=green]SUCCESSFUL![/color][/b]`);
            }
            else{
                fight.message.addInfo(`${this.attacker.name} rolled ${this.diceScore}, the ${Action[this.type]} attack [b][color=green]HITS![/color][/b]`);
            }
        }
        else{
            fight.message.addInfo(`${this.attacker.name} rolled ${this.diceScore}, the ${Action[this.type]} attack [b][color=red]MISSED![/color][/b]`);
        }

        if(this.requiresRoll){
            fight.message.addInfo(`${this.attacker.name} needed to roll ${this.requiredDiceScore()} for the${(this.tier != -1 ?" "+Tier[this.tier]:"")} ${Action[this.type]} attack to hit.`);
        }

        fight.pastActions.push(this);

        if (this.hpDamageToDef > 0) {
            this.defender.hitHP(this.hpDamageToDef);
        }
        if (this.lpDamageToDef > 0) {
            this.defender.hitLP(this.lpDamageToDef);
        }
        if(this.fpDamageToDef > 0){
            this.defender.hitFP(this.fpDamageToDef);
        }
        if (this.hpHealToDef > 0) {
            this.defender.healHP(this.hpHealToDef);
        }
        if (this.lpHealToDef > 0) {
            this.defender.healLP(this.lpHealToDef);
        }
        if(this.fpHealToDef > 0){
            this.defender.healFP(this.fpHealToDef);
        }


        if (this.hpDamageToAtk > 0) {
            this.attacker.hitHP(this.hpDamageToAtk);
        }
        if (this.lpDamageToAtk > 0) {
            this.attacker.hitLP(this.lpDamageToAtk);
        }
        if(this.fpDamageToAtk > 0){
            this.attacker.hitFP(this.fpDamageToAtk);
        }
        if (this.hpHealToAtk > 0) {
            this.attacker.healHP(this.hpHealToAtk);
        }
        if (this.lpHealToAtk > 0) {
            this.attacker.healLP(this.lpHealToAtk);
        }
        if(this.fpHealToAtk > 0){
            this.attacker.healFP(this.fpHealToAtk);
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

        if(this.type == Action.Tag){
            fight.message.addInfo(`[b][color=red]TAG![/color][/b] ${this.defender.name} enters inside the ring!`);
        }
        else if(this.defender.isDead()){
            fight.message.addInfo(`${this.defender.name} couldn't take the hits anymore! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerPermanentOutsideRing();
        }
        else if(this.defender.isSexuallyExhausted()){
            fight.message.addInfo(`${this.defender.name} is too sexually exhausted to continue! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerPermanentOutsideRing();
        }
        else if(this.defender.isBroken()){
            fight.message.addInfo(`${this.defender.name} is too mentally exhausted to continue! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerPermanentOutsideRing();
        }
        else if(this.defender.isCompletelyBound()){
            fight.message.addInfo(`${this.defender.name} has too many items on them to possibly fight! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerPermanentOutsideRing();
        }
        else if(!this.defender.isInTheRing || !this.attacker.isInTheRing){
            fight.message.addInfo(`${this.defender.name} can't stay inside the ring anymore! [b][color=red]They're out![/color][/b]`);
        }

        //Save it to the DB
        FightAction.commitDb(this);

        //check for fight ending status
        if (!fight.isFightOver()) {
            fight.nextTurn();
        } else { //if there's only one team left in the fight, then we're sure it's over
            fight.outputStatus();
            var tokensToGiveToWinners:number = TokensPerWin[FightTier[fight.getFightTier(fight.winnerTeam)]];
            var tokensToGiveToLosers:number = tokensToGiveToWinners*Constants.tokensPerLossMultiplier;
            fight.endFight(tokensToGiveToWinners, tokensToGiveToLosers);
        }
    }
}