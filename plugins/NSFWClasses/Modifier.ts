import {Fighter} from "./Fighter";
import {FighterList} from "./FighterList";
export interface Modifier{
    applier: Fighter;
    receiver: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
}

export class BaseModifier{
    applier: Fighter;
    receiver: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceRoll: number;
    escapeRoll: number;
    uses: number;

    constructor(applier:Fighter, receiver: Fighter){
        this.applier = applier;
        this.receiver = receiver;
    }

    isOver():boolean{
        if(this.uses <= 0 || this.receiver.isDead() || this.receiver.isSexuallyExhausted()){
            return true;
        }
        return false;
    }

    tick():void{
        this.uses--;
        if(this.hpDamage > 0){
            this.receiver.hitHp(this.hpDamage);
        }
        if(this.lustDamage > 0){
            this.receiver.hitLust(this.lustDamage);
        }
        if(this.diceRoll != 0){
            this.receiver.dice.addTmpMod(this.diceRoll,1);
        }
        if(this.focusDamage > 0){
            this.receiver.hitFocus(this.focusDamage);
        }
    }
}

export class HoldModifier extends BaseModifier {
}