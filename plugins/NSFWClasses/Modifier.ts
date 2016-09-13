import {Fighter} from "./Fighter";
import {FighterList} from "./FighterList";
export interface IModifier{
    applier: Fighter;
    receiver: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    eventTrigger:Trigger;

    isOver():boolean;
    trigger(event:Trigger):void;
    willTriggerForEvent(event:Trigger):void;
}

export enum Trigger{
    OnTurnTick = 0,
    OnHPDamage = 1,
    OnLustDamage = 2,
    OnFocusDamage = 3,
    OnOrgasm = 4,
    OnHeartBroken = 5,
    Permanent = 6
}

export class BaseModifier implements IModifier{
    applier: Fighter;
    receiver: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    eventTrigger:Trigger = 0;

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

    willTriggerForEvent(event:Trigger){
        return event == this.eventTrigger;
    }

    trigger(event:Trigger):void{
        if(this.willTriggerForEvent(event)){
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
            this.receiver.fight.sendMessage();
            if(this.isOver()){
                this.receiver.modifiers.splice(this.receiver.modifiers.indexOf(this));
            }
        }
    }
}

export class HoldModifier extends BaseModifier {
    trigger(event:Trigger):void{
        if(this.willTriggerForEvent(event)){
            this.receiver.fight.addMessage(`${this.receiver.getStylizedName()} is still locked up in that hold!`);
            super.trigger(event);
        }
    }
}