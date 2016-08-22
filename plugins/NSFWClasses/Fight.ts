///<reference path="Fighter.ts" />
class Fight {
    id: number;
    turnCounter: number;
    fighters: Array<Fighter>;
    stage: string;

    constructor(stage: string){
        this.stage = stage;
    }

    getFighterCount(){
        return this.fighters.length;
    }

    getId(){
        return this.id;
    }




}