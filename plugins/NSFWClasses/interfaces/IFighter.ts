import {Dice} from "../Dice";
export interface IFighter {
    id:number;
    name:string;
    bronzeTokens:number;
    silverTokens: number;
    goldTokens: number;
    totalTokens: number;
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
    hp:number;
    heartsRemaining:number;
    lust:number;
    orgasmsRemaining:number;
    focus:number;
    lastAttack:string ;
    usedAttacks:Array<string>;
    dice: Dice;

}