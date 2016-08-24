import {Fighter} from "./Fighter";
import {BaseModel} from "./Model";
import {Dice} from "./Dice";

export class Fight extends BaseModel{
    id:number;
    turnCounter:number;
    fighters:Array<Fighter>;
    stage:string;

    public constructor(stage:string) {
        super();
        this.stage = stage;
    }

    getFighterCount() {
        return this.fighters.length;
    }

    getId() {
        return this.id;
    }


}