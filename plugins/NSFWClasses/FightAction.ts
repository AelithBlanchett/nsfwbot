import {Fighter} from "./Fighter";
import {Constants} from "./Constants";
import Tier = Constants.Tier;

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

    }
}