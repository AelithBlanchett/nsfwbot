import {Dice} from "../Dice";
import {Action} from "../Action";
export interface IFighter {
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
    features:Array<any>;




    //during fight
    isReady:boolean;
    hp:number;
    heartsRemaining:number;
    lust:number;
    orgasmsRemaining:number;
    focus:number;
    dice: Dice;

}