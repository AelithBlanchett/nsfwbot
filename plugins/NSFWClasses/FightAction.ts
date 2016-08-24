import {Fighter} from "./Fighter";
import {BaseModel} from "./Model";
export class FightAction extends BaseModel{
    id: number;
    atTurn: number;
    action: string;
    tier: string;
    isHold: boolean;
    attacker: Fighter;
    defender: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceScore: number;
}