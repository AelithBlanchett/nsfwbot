import {Fighter} from "./Fighter";
import {Constants} from "./Constants";
import Tier = Constants.Tier;
import {Data} from "./Model";
import RequiredRoll = Constants.RequiredRoll;
import BaseDamage = Constants.BaseDamage;
import {Fight} from "./Fight";
import {Dice} from "./Dice";

export class FightAction{
    id: number;
    fightId: number;
    atTurn: number;
    type: string;
    tier: Tier;
    isHold: boolean;
    attacker: Fighter;
    defender: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceScore: number;
    missed: boolean;

    constructor(fightId:number, currentTurn:number, tier:Tier, attacker:Fighter, defender?:Fighter) {
        this.fightId = fightId;
        this.type = "";
        this.isHold = false;
        this.missed = true;
        this.hpDamage = 0;
        this.lustDamage = 0;
        this.diceScore = 0;
        this.tier = tier;
        this.atTurn = currentTurn;
        this.attacker = attacker;
        this.defender = defender;
    }

    attackFormula(tier:Tier, actorAtk:number, targetDef:number, roll:number):number{
        return BaseDamage[Tier[tier]]-(actorAtk-targetDef)+roll;
    }

    actionBrawl():FightAction{
        this.type = "brawl";
        this.diceScore = this.attacker.dice.roll(1) + this.attacker.power;
        if(this.diceScore >= RequiredRoll[Tier[this.tier]]){
            this.missed = false;
            this.hpDamage = this.attackFormula(this.tier, this.attacker.power, this.defender.toughness, this.diceScore);
        }
        return this;
    }

    actionTag():FightAction{ //"skips" a turn
        this.type = "tag";
        this.diceScore = 0;
        this.attacker.isInTheRing = false;
        this.defender.isInTheRing = true;
        this.missed = false;
        return this;
    }

    actionPass():FightAction{ //"skips" a turn
        this.type = "pass";
        this.diceScore = 0;
        this.missed = false;
        return this;
    }

    commitDb(){
        let attackerId = this.attacker.id || null;
        let defenderId = this.defender.id || null;
        var sql = "INSERT INTO `flistplugins`.?? (`idFight`,`atTurn`,`type`,`tier`,`isHold`,`idAttacker`,`idDefender`,`hpDamage`,`lustDamage`,`focusDamage`,`diceScore`,`missed`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);";
        sql = Data.db.format(sql, [Constants.actionTableName, this.fightId, this.atTurn, this.type, this.tier, this.isHold, attackerId, defenderId, this.hpDamage, this.lustDamage, this.focusDamage, this.diceScore, this.missed]);
        Data.db.query(sql, (err, results) => {
            if (err) {
                throw err;
            }
            else {
                this.id = results.insertId;
            }
        });
    }

    commit(fight:Fight){
        if(this.missed == false){
            fight.addMessage(`${this.attacker.name} rolled ${this.diceScore}, the ${this.type} attack [b][color=green]HITS![/color][/b]`);
        }
        else{
            fight.addMessage(`${this.attacker.name} rolled ${this.diceScore}, the ${this.type} attack [b][color=red]MISSED![/color][/b]`);
        }

        fight.pastActions.push(this);

        if(this.missed == false) {
            if (this.hpDamage > 0) {
                this.defender.hitHp(this.hpDamage);
            }
            if (this.lustDamage > 0) {
                this.defender.hitLust(this.lustDamage);
            }
        }

        if(this.type == "tag"){
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

        //Save it to the DB
        this.commitDb();

        //check for fight ending status
        if (fight.fighterList.getUsedTeams().length != 1) {
            fight.nextTurn();
        } else { //if there's only one team left in the fight, then we're sure it's over
            fight.outputStatus();
            fight.endFight();
        }
    }
}