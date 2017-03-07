import {ActiveFighter} from "../ActiveFighter";
import {ModifierType, Tier, Trigger, TriggerMoment} from "../Constants";
import {Action} from "../Action";
import {Fight} from "../Fight";

export interface IModifier{
    idModifier: string;
    idFight: string;
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
    hpHeal: number;
    lustHeal: number;
    focusHeal: number;
    areDamageMultipliers: boolean;
    diceRoll: number;
    escapeRoll: number;
    uses: number;
    event:Trigger;
    timeToTrigger:TriggerMoment;
    idParentActions: Array<string>;

    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;

    fight:Fight;

    isOver():boolean;
    trigger(moment: TriggerMoment, event:Trigger, objFightAction?:any):void;
    willTriggerForEvent(moment: TriggerMoment, event:Trigger):boolean;
    build(receiver:ActiveFighter, applier:ActiveFighter, fight:Fight):void;
}