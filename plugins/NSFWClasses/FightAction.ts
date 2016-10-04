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
import FocusDamageHumHold = Constants.FocusDamageHumHold;
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
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceScore: number;
    missed: boolean;
    requiresRoll: boolean;

    constructor(fightId:number, currentTurn:number, tier:Tier, actionType:Action, attacker:Fighter, defender?:Fighter) {
        this.fightId = fightId;
        this.isHold = false;
        this.modifiers = new Modifiers();
        this.missed = true;
        this.hpDamage = 0;
        this.lustDamage = 0;
        this.focusDamage = 0;
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
            case Action.SexStrike:
                result = this.actionSexStrike();
                break;
            case Action.SubHold:
                result = this.actionSubHold();
                break;
            case Action.SexHold:
                result = this.actionSexHold();
                break;
            case Action.HumHold:
                result = this.actionHumHold();
                break;
            case Action.Bondage:
                result = this.actionBondage();
                break;
            case Action.ItemPickup:
                result = this.actionItemPickup();
                break;
            case Action.SextoyPickup:
                result = this.actionSextoyPickup();
                break;
            case Action.Degradation:
                result = this.actionDegradation();
                break;
            case Action.Tag:
                result = this.actionTag();
                break;
            case Action.Rest:
                result = this.actionRest();
                break;
            default:
                result = Trigger.None;
                break;
        }
        return result;
    }

    actionBrawl():Trigger{
        this.attacker.triggerMods(Trigger.BeforeBrawlAttack);
        this.diceScore = this.attacker.roll(1) + this.attacker.power;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.attacker.healFP(1);
            this.defender.hitFP(1);
            this.hpDamage += this.attackFormula(this.tier, this.attacker.power, this.defender.toughness, this.diceScore);
        }
        return Trigger.AfterBrawlAttack;
    }

    actionSexStrike():Trigger{
        this.attacker.triggerMods(Trigger.BeforeSexStrikeAttack);
        this.type = Action.SexStrike;
        this.diceScore = this.attacker.roll(1) + this.attacker.sensuality;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.attacker.healFP(1);
            this.defender.hitFP(1);
            this.lustDamage += this.attackFormula(this.tier, this.attacker.sensuality, this.defender.endurance, this.diceScore);
        }
        return Trigger.AfterSexStrikeAttack;
    }

    actionSubHold():Trigger{
        this.attacker.triggerMods(Trigger.BeforeSubmissionHold);
        this.type = Action.SubHold;
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.power;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.attacker.healFP(1);
            this.defender.hitFP(1);
            let hpDamage = this.attackFormula(this.tier, this.attacker.power, this.defender.toughness, this.diceScore);
            let holdModifier = new HoldModifier(this.defender, this.attacker, ModifierType.SubHold, hpDamage, 0, 0);
            let brawlBonusAttacker = new BrawlBonusSubHoldModifier(this.attacker, [holdModifier.id]);
            let brawlBonusDefender = new BrawlBonusSubHoldModifier(this.defender, [holdModifier.id]);
            this.modifiers.push(holdModifier);
            this.modifiers.push(brawlBonusAttacker);
            this.modifiers.push(brawlBonusDefender);
        }
        return Trigger.AfterSubmissionHold;
    }

    actionSexHold():Trigger{
        this.attacker.triggerMods(Trigger.BeforeSexHoldAttack);
        this.type = Action.SexHold;
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.sensuality;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.attacker.healFP(1);
            this.defender.hitFP(1);
            let lustDamage = this.attackFormula(this.tier, this.attacker.sensuality, this.defender.endurance, this.diceScore);
            let holdModifier = new HoldModifier(this.defender, this.attacker, ModifierType.SexHold, 0, lustDamage, 0);
            let lustBonusAttacker = new LustBonusSexHoldModifier(this.attacker, [holdModifier.id]);
            let lustBonusDefender = new LustBonusSexHoldModifier(this.defender, [holdModifier.id]);
            this.modifiers.push(holdModifier);
            this.modifiers.push(lustBonusAttacker);
            this.modifiers.push(lustBonusDefender);
        }
        return Trigger.AfterSexHoldAttack;
    }

    actionHumHold():Trigger{
        this.attacker.triggerMods(Trigger.BeforeHumiliationHold);
        this.type = Action.HumHold;
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.sensuality;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.attacker.healFP(3);
            let focusDamage = FocusDamageHumHold[Tier[this.tier]];
            let holdModifier = new HoldModifier(this.defender, this.attacker, ModifierType.HumHold, 0, 0, focusDamage);
            this.modifiers.push(holdModifier);
        }
        return Trigger.AfterHumiliationHold;
    }

    actionBondage():Trigger{
        this.attacker.triggerMods(Trigger.BeforeBondage);
        this.type = Action.Bondage;
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.attacker.healFP(2);
        this.defender.hitFP(3);
        let bdModifier = new BondageModifier(this.defender, this.attacker);
        this.modifiers.push(bdModifier);
        return Trigger.AfterBondage;
    }

    actionForceFuck():Trigger{
        this.attacker.triggerMods(Trigger.BeforeSexStrikeAttack);
        this.type = Action.SexStrike;
        this.diceScore = this.attacker.roll(1) + this.attacker.sensuality;
        if(this.diceScore >= this.requiredDiceScore()){
            this.missed = false;
            this.attacker.healFP(1);
            this.defender.hitFP(1);
            this.lustDamage += this.attackFormula(this.tier, this.attacker.sensuality, this.defender.endurance, this.diceScore);
        }
        return Trigger.AfterSexStrikeAttack;
    }

    actionItemPickup():Trigger{
        this.attacker.triggerMods(Trigger.BeforeItemPickup);
        this.type = Action.ItemPickup;
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.attacker.healFP(1);
        this.defender.hitFP(1);
        let itemPickupModifier = new ItemPickupModifier(this.attacker);
        this.modifiers.push(itemPickupModifier);
        return Trigger.AfterItemPickup;
    }

    actionSextoyPickup():Trigger{
        this.attacker.triggerMods(Trigger.BeforeSextoyPickup);
        this.type = Action.SextoyPickup;
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.attacker.healFP(1);
        this.defender.hitFP(1);
        let itemPickupModifier = new SextoyPickupModifier(this.attacker);
        this.modifiers.push(itemPickupModifier);
        return Trigger.AfterSextoyPickup;
    }

    actionDegradation():Trigger{
        this.attacker.triggerMods(Trigger.BeforeDegradation);
        this.type = Action.Degradation;
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.defender.hitFP(2);
        this.defender.hitFP(3);
        let humiliationModifier = new DegradationModifier(this.defender, this.attacker);
        this.modifiers.push(humiliationModifier);
        return Trigger.AfterDegradation;
    }

    actionTag():Trigger{ //"skips" a turn
        this.attacker.triggerMods(Trigger.BeforeTag);
        this.type = Action.Tag;
        this.diceScore = -1;
        this.requiresRoll = false;
        this.attacker.lastTagTurn = this.atTurn;
        this.defender.lastTagTurn = this.atTurn;
        this.attacker.isInTheRing = false;
        this.defender.isInTheRing = true;
        this.missed = false;
        return Trigger.AfterTag;
    }

    actionRest():Trigger{ //"skips" a turn
        this.attacker.triggerMods(Trigger.BeforeRest);
        this.type = Action.Rest;
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        this.attacker.healHP(this.attacker.hp*Constants.hpPercantageToHealOnRest);
        this.attacker.healLP(this.attacker.hp*Constants.lpPercantageToHealOnRest);
        this.attacker.healFP(this.attacker.hp*Constants.fpPointsToHealOnRest);
        return Trigger.AfterRest;
    }

    static commitDb(action:FightAction){
        return new Promise<number>(function(resolve, reject) {
            let attackerId = action.attacker.id || null;
            let defenderId = null;
            if(action.defender){
                defenderId = action.defender.id;
            }
            var sql = Constants.SQL.commitFightAction;
            sql = Data.db.format(sql, [Constants.actionTableName, action.fightId, action.atTurn, action.type, action.tier, action.isHold, attackerId, defenderId, action.hpDamage, action.lustDamage, action.focusDamage, action.diceScore, action.missed]);
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
        fight.addMessage("\n");
        if(this.missed == false){
            if(this.requiresRoll == false){ //-1 == no roll
                fight.addMessage(`The ${Action[this.type]} is [b][color=green]SUCCESSFUL![/color][/b]`);
            }
            else{
                fight.addMessage(`${this.attacker.name} rolled ${this.diceScore}, the ${Action[this.type]} attack [b][color=green]HITS![/color][/b]`);
            }
        }
        else{
            fight.addMessage(`${this.attacker.name} rolled ${this.diceScore}, the ${Action[this.type]} attack [b][color=red]MISSED![/color][/b]`);
        }

        if(this.requiresRoll){
            fight.addMessage(`${this.attacker.name} needed to roll ${this.requiredDiceScore()} for the${(this.tier != -1 ?" "+Tier[this.tier]:"")} ${Action[this.type]} attack to hit.`);
        }

        fight.pastActions.push(this);

        if(this.missed == false) {
            if (this.hpDamage > 0) {
                this.defender.hitHP(this.hpDamage);
            }
            if (this.lustDamage > 0) {
                this.defender.hitLP(this.lustDamage);
            }
            if(this.focusDamage != 0){
                this.defender.hitFP(this.focusDamage);
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
                                mod.eventTrigger = this.modifiers[indexOfNewHold].eventTrigger;
                                mod.uses += this.modifiers[indexOfNewHold].uses;
                                mod.hpDamage += this.modifiers[indexOfNewHold].hpDamage;
                                mod.lustDamage += this.modifiers[indexOfNewHold].lustDamage;
                                mod.focusDamage += this.modifiers[indexOfNewHold].focusDamage;
                                //Did not add the dice/escape score modifications, if needed, implement here
                            }
                            else if(mod.parentIds.indexOf(idOfFormerHold) != -1){
                                mod.uses += this.modifiers[indexOfNewHold].uses;
                            }
                        }
                        for(let mod of this.attacker.modifiers){
                            //update the bonus modifiers length
                            if(mod.parentIds.indexOf(idOfFormerHold) != -1){
                                mod.uses += this.modifiers[indexOfNewHold].uses;
                            }
                        }
                        fight.addMessage(`[b][color=red]Hold Stacking![/color][/b] ${this.defender.name} will have to suffer this hold for ${this.modifiers[indexOfNewHold].uses} more turns, and will also suffer a bit more!\n
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
        }

        if(this.type == Action.Tag){
            fight.addMessage(`[b][color=red]TAG![/color][/b] ${this.defender.name} enters inside the ring!`);
        }
        else if(this.defender.isDead()){
            fight.addMessage(`${this.defender.name} couldn't take the hits anymore! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerPermanentOutsideRing();
        }
        else if(this.defender.isSexuallyExhausted()){
            fight.addMessage(`${this.defender.name} is too sexually exhausted to continue! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerPermanentOutsideRing();
        }
        else if(this.defender.isBroken()){
            fight.addMessage(`${this.defender.name} is too mentally exhausted to continue! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerPermanentOutsideRing();
        }
        else if(this.defender.isCompletelyBound()){
            fight.addMessage(`${this.defender.name} has too many items on them to possibly fight! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerPermanentOutsideRing();
        }
        else if(!this.defender.isInTheRing || !this.attacker.isInTheRing){
            fight.addMessage(`${this.defender.name} can't stay inside the ring anymore! [b][color=red]They're out![/color][/b]`);
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