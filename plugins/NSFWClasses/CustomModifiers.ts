import {Modifier} from "./Modifier";
import {Constants} from "./Constants";
import Trigger = Constants.Trigger;
import {Fighter} from "./Fighter";

export class DummyModifier extends Modifier {

    constructor(receiver: Fighter, applier:Fighter, hpDamage:number, lustDamage:number, focusDamage: number, uses:number, parentId:Array<string>, holdName:string){
        super(receiver, applier, hpDamage, lustDamage, focusDamage, 0, 0, uses, Constants.Trigger.BeforeTurnTick, parentId, false, holdName);
    }

    trigger(event:Trigger):void{
        if(this.willTriggerForEvent(event)){
            //something else happens here
        }
    }
}