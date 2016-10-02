import {Fighter} from "./Fighter";
import {FighterList} from "./FighterList";
import {Constants} from "./Constants";
import Trigger = Constants.Trigger;
import {Utils} from "./Utils";

export interface IModifier{
    id: string;
    name:string;
    applier: Fighter;
    receiver: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    eventTrigger:Trigger;
    parentIds: Array<string>;

    isOver():boolean;
    trigger(event:Trigger):void;
    willTriggerForEvent(event:Trigger):void;
}

export class Modifier implements IModifier{
    id: string;
    name:string = "modifier";
    applier: Fighter;
    receiver: Fighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    eventTrigger:Trigger = 0;
    parentIds: Array<string>;

    constructor(receiver:Fighter, applier:Fighter, hpDamage:number, lustDamage:number, focusDamage: number, diceRoll: number, escapeRoll: number, uses:number, eventTrigger:Trigger, parentIds:Array<string>, name?:string){
        this.id = Utils.generateUUID();
        this.receiver = receiver; //ALWAYS filled!
        this.applier = applier; //can be null
        this.hpDamage = hpDamage;
        this.lustDamage = lustDamage;
        this.focusDamage = focusDamage;
        this.diceRoll = diceRoll;
        this.escapeRoll = escapeRoll;
        this.uses = uses;
        this.eventTrigger = eventTrigger;
        this.parentIds = parentIds;
        if(name) {
            this.name = name;
        }
    }

    isOver():boolean{
        return (this.uses <= 0 || this.receiver.isDead() || this.receiver.isSexuallyExhausted());
    }

    willTriggerForEvent(event:Trigger){
        return event == this.eventTrigger;
    }

    trigger(event:Trigger):void{
        if(this.willTriggerForEvent(event)){
            this.receiver.fight.addMessage(`${this.receiver.getStylizedName()} is still affected by the ${this.name}!`);
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