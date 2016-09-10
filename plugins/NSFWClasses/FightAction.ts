import {Fighter} from "./Fighter";
import {Constants} from "./Constants";
import Tier = Constants.Tier;
import {Data} from "./Model";

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

    constructor(fightId:number) {
        this.fightId = fightId;
        this.type = "";
        this.isHold = false;
        this.missed = true;
        this.hpDamage = 0;
        this.lustDamage = 0;
        this.diceScore = 0;
    }

    commitDb(){
        let attackerId = this.attacker.id || null;
        let defenderId = this.defender.id || null;
        var sql = "INSERT INTO `flistplugins`.`nsfw_actions` (`idFight`,`atTurn`,`type`,`tier`,`isHold`,`idAttacker`,`idDefender`,`hpDamage`,`lustDamage`,`focusDamage`,`diceScore`,`missed`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);";
        sql = Data.db.format(sql, [this.fightId, this.atTurn, this.type, this.tier, this.isHold, attackerId, defenderId, this.hpDamage, this.lustDamage, this.focusDamage, this.diceScore, this.missed]);
        Data.db.query(sql, (err, results) => {
            if (err) {
                throw err;
            }
            else {
                this.id = results.insertId;
            }
        });
    }
}