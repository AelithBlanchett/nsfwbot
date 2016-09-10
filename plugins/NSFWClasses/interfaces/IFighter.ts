import {Dice} from "../Dice";
import {FightAction} from "../FightAction";
export interface IFighter {
    id:number;
    name:string;
    tokens: number;
    wins: number;
    losses: number;
    forfeits: number;
    quits: number;

    power:number;
    dexterity:number;
    toughness:number;
    endurance:number;
    willpower:number;




    //during fight
    isReady:boolean;
    hp:number;
    heartsRemaining:number;
    lust:number;
    orgasmsRemaining:number;
    focus:number;
    dice: Dice;

}