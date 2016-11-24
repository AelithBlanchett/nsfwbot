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
    achievements:Array<any>;
}