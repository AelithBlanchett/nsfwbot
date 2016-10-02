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

export class FightAction{
    id: number;
    fightId: number;
    atTurn: number;
    type: Action;
    tier: Tier;
    isHold: boolean;
    modifiers: Array<Modifier>;
    attacker: Fighter;
    defender: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceScore: number;
    missed: boolean;
    requiresRoll: boolean;

    constructor(fightId:number, currentTurn:number, tier:Tier, attacker:Fighter, defender?:Fighter) {
        this.fightId = fightId;
        this.isHold = false;
        this.modifiers = [];
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
    }

    strikeFormula(tier:Tier, actorAtk:number, targetDef:number, roll:number):number{
        return BaseDamage[Tier[tier]]-(actorAtk-targetDef)+roll;
    }

    requiredDiceScore(attack:Action, tier:Tier):number{
        let scoreRequired = 0;
        //difficulties here
        //if fighter.indexOf(mod) != -1 then add some difficulty
        scoreRequired += TierDifficulty[Tier[this.tier]];
        return scoreRequired;
    }

    actionGateway(actionType:Action):Trigger{
        let result;
        switch (actionType) {
            case Action.Brawl:
                result = this.actionBrawl();
                break;
            case Action.SexStrike:
                result = this.actionSexStrike();
                break;
            case Action.SubHold:
                result = this.actionSubHold();
                break;
            case Action.Tag:
                result = this.actionTag();
                break;
            case Action.Pass:
                result = this.actionPass();
                break;
            default:
                result = Trigger.None;
                break;
        }
        return result;
    }

    actionBrawl():Trigger{
        this.attacker.triggerMods(Trigger.BeforeBrawlAttack);
        this.type = Action.Brawl;
        this.diceScore = this.attacker.roll(1) + this.attacker.power;
        if(this.diceScore >= this.requiredDiceScore(this.type, this.tier)){
            this.missed = false;
            this.hpDamage = this.strikeFormula(this.tier, this.attacker.power, this.defender.toughness, this.diceScore);
        }
        return Trigger.AfterBrawlAttack;
    }

    actionSexStrike():Trigger{
        this.attacker.triggerMods(Trigger.BeforeSexStrikeAttack);
        this.type = Action.SexStrike;
        this.diceScore = this.attacker.roll(1) + this.attacker.sensuality;
        if(this.diceScore >= this.requiredDiceScore(this.type, this.tier)){
            this.missed = false;
            this.lustDamage = this.strikeFormula(this.tier, this.attacker.sensuality, this.defender.endurance, this.diceScore);
        }
        return Trigger.AfterSexStrikeAttack;
    }

    actionSubHold():Trigger{
        this.attacker.triggerMods(Trigger.BeforeSubmissionHold);
        this.type = Action.SubHold;
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.power;
        if(this.diceScore >= this.requiredDiceScore(this.type, this.tier)){
            this.missed = false;
            let hpDamage = 1;
            let lustDamage = 0;
            let focusDamage = 0;
            let turns = 5;
            let parentModifier = new Modifier(this.defender, this.attacker, hpDamage, lustDamage, focusDamage, 0, 0, turns, Constants.Trigger.BeforeTurnTick, [], Constants.Modifier.SubHold);
            let accuracyBonus = 3;
            let brawlBonusAttacker = new Modifier(this.attacker, this.defender, 0, 0, 0, accuracyBonus, 0, turns, Constants.Trigger.BeforeBrawlAttack, [parentModifier.id], Constants.Modifier.SubHoldBrawlBonus);
            let brawlBonusDefender = new Modifier(this.defender, this.attacker, 0, 0, 0, accuracyBonus, 0, turns, Constants.Trigger.BeforeBrawlAttack, [parentModifier.id], Constants.Modifier.SubHoldBrawlBonus);
            this.modifiers.push(parentModifier);
            this.modifiers.push(brawlBonusAttacker);
            this.modifiers.push(brawlBonusDefender);
        }
        return Trigger.AfterSubmissionHold;
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

    actionPass():Trigger{ //"skips" a turn
        this.attacker.triggerMods(Trigger.BeforePass);
        this.type = Action.Pass;
        this.diceScore = -1;
        this.requiresRoll = false;
        this.missed = false;
        return Trigger.AfterPass;
    }

    static commitDb(action:FightAction){
        let attackerId = action.attacker.id || null;
        let defenderId = action.defender.id || null;
        var sql = "INSERT INTO `flistplugins`.?? (`idFight`,`atTurn`,`type`,`tier`,`isHold`,`idAttacker`,`idDefender`,`hpDamage`,`lustDamage`,`focusDamage`,`diceScore`,`missed`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);";
        sql = Data.db.format(sql, [Constants.actionTableName, action.fightId, action.atTurn, action.type, action.tier, action.isHold, attackerId, defenderId, action.hpDamage, action.lustDamage, action.focusDamage, action.diceScore, action.missed]);
        Data.db.query(sql, (err, results) => {
            if (err) {
                throw err;
            }
            else {
                action.id = results.insertId;
            }
        });
    }

    commit(fight:Fight){
        fight.addMessage("\n");
        if(this.missed == false){
            if(this.requiresRoll == false){ //-1 == no roll
                //fight.addMessage(`The ${this.type} is [b][color=green]SUCCESSFUL![/color][/b]`);
            }
            else{
                fight.addMessage(`${this.attacker.name} rolled ${this.diceScore}, the ${Action[this.type]} attack [b][color=green]HITS![/color][/b]`);
            }
        }
        else{
            fight.addMessage(`${this.attacker.name} rolled ${this.diceScore}, the ${Action[this.type]} attack [b][color=red]MISSED![/color][/b]`);
        }

        if(this.requiresRoll){
            fight.addMessage(`${this.attacker.name} needed to roll ${this.requiredDiceScore(this.type, this.tier)} for the${(this.tier != -1 ?" "+Tier[this.tier]:"")} ${Action[this.type]} attack to hit.`);
        }

        fight.pastActions.push(this);

        if(this.missed == false) {
            if (this.hpDamage > 0) {
                this.defender.hitHp(this.hpDamage);
            }
            if (this.lustDamage > 0) {
                this.defender.hitLust(this.lustDamage);
            }
            if(this.focusDamage != 0){
                this.defender.hitFocus(this.focusDamage);
            }
            if(this.modifiers.length > 0){
                if(this.type == Action.SubHold){ //for any holds, do the stacking here
                    let indexOfNewHold = this.modifiers.findIndex(x => x.name == Constants.Modifier.SubHold);
                    let indexOfAlreadyExistantHoldForDefender = this.defender.modifiers.findIndex(x => x.name == Constants.Modifier.SubHold);
                    if(indexOfAlreadyExistantHoldForDefender != -1){
                        let idOfFormerHold = this.defender.modifiers[indexOfAlreadyExistantHoldForDefender].id;
                        for(let mod of this.defender.modifiers){
                            //we updated the children and parent's damage and turns
                            if(mod.id == idOfFormerHold || mod.parentIds.indexOf(idOfFormerHold) != -1){
                                mod.uses += this.modifiers[indexOfNewHold].uses;
                                mod.hpDamage += this.modifiers[indexOfNewHold].hpDamage;
                                mod.lustDamage += this.modifiers[indexOfNewHold].lustDamage;
                                mod.focusDamage += this.modifiers[indexOfNewHold].focusDamage;
                                //Did not add the dice/escape score modifications, if needed, implement here
                            }
                        }
                        for(let mod of this.attacker.modifiers){
                            //we updated the children and parent's damage and turns
                            if(mod.id == idOfFormerHold || mod.parentIds.indexOf(idOfFormerHold) != -1){
                                mod.uses += this.modifiers[indexOfNewHold].uses;
                                mod.hpDamage += this.modifiers[indexOfNewHold].hpDamage;
                                mod.lustDamage += this.modifiers[indexOfNewHold].lustDamage;
                                mod.focusDamage += this.modifiers[indexOfNewHold].focusDamage;
                                //Did not add the dice/escape score modifications, if needed, implement here
                            }
                        }
                        fight.addMessage(`[b][color=red]Hold Stacking![/color][/b] ${this.defender.name} will have to suffer this hold for ${this.modifiers[indexOfNewHold].uses} more turns,\
                         and will also suffer a bit more!\n\
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

        if(this.defender.isDead()){
            fight.addMessage(`${this.defender.name} couldn't take the hits anymore! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerOutsideRing();
        }
        else if(this.defender.isSexuallyExhausted()){
            fight.addMessage(`${this.defender.name} is too sexually exhausted to continue! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerOutsideRing();
        }
        else if(this.defender.isBroken()){
            fight.addMessage(`${this.defender.name} is too mentally exhausted to continue! [b][color=red]They're out![/color][/b]`);
            this.defender.triggerOutsideRing();
        }
        else if(!this.defender.isInTheRing || !this.attacker.isInTheRing){
            fight.addMessage(`${this.defender.name} can't stay inside the ring anymore! [b][color=red]They're out![/color][/b]`);
        }

        //Save it to the DB
        FightAction.commitDb(this);

        //check for fight ending status
        if (fight.fighterList.getUsedTeams().length != 1) {
            fight.nextTurn();
        } else { //if there's only one team left in the fight, then we're sure it's over
            fight.outputStatus();
            fight.endFight();
        }
    }
}