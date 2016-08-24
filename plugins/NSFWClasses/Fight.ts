import {Fighter} from "./Model";
export class Fight {
    id:number;
    turnCounter:number;
    fighters:Array<Fighter>;
    stage:string;

    public constructor(stage:string) {
        this.stage = stage;
    }

    getFighterCount() {
        return this.fighters.length;
    }

    getId() {
        return this.id;
    }


}