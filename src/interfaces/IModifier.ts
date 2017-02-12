import {ActiveFighter} from "../ActiveFighter";
import {ModifierType, Tier, Trigger, TriggerMoment} from "../Constants";
import {Action} from "../Action";

export interface IModifier{
    id: string;
    name:string;
    tier:Tier;
    type:ModifierType;
    applier: ActiveFighter;
    idApplier: string;
    receiver: ActiveFighter;
    idReceiver: string;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    areDamageMultipliers: boolean;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    event:Trigger;
    timeToTrigger:TriggerMoment;
    parentActionIds: Array<string>;

    isOver():boolean;
    trigger(moment: TriggerMoment, event:Trigger, objFightAction?:any):void;
    willTriggerForEvent(moment: TriggerMoment, event:Trigger):boolean;
    build(receiver:ActiveFighter, applier:ActiveFighter, tier:Tier, modType:ModifierType, hpDamage:number, lustDamage:number, focusDamage:number, diceRoll:number, escapeRoll:number, uses:number,
          timeToTrigger:TriggerMoment, event:Trigger, parentActionIds:Array<string>, areMultipliers:boolean):void;
}