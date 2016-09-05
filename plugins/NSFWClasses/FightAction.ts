import {Fighter} from "./Fighter";
import {BaseModel} from "./Model";
import {Constants} from "./Constants";
import Tiers = Constants.Tiers;

export class FightAction extends BaseModel{
    id: number;
    atTurn: number;
    action: string;
    tier: Tiers;
    isHold: boolean;
    attacker: Fighter;
    defender: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceScore: number;
    missed: boolean;
}