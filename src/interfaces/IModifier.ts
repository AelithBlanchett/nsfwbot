import {ActiveFighter} from "../ActiveFighter";
import {ModifierType, Tier, Trigger, TriggerMoment} from "../Constants";
import {Action} from "../Action";

export interface IModifier{
    id: string;
    name:string;
    tier:Tier;
    type:ModifierType;
    applier: ActiveFighter;
    receiver: ActiveFighter;
    hpDamage: number;
    lustDamage: number;
    focusDamage: number;
    areDamageMultipliers: boolean;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    parentAction: Action;
    event:Trigger;
    timeToTrigger:TriggerMoment;
    parentIds: Array<string>;

    isOver():boolean;
    trigger(moment: TriggerMoment, event:Trigger, objFightAction?:any):void;
    willTriggerForEvent(moment: TriggerMoment, event:Trigger):boolean;
}