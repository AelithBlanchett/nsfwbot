import {Modifier} from "./Modifier";
import * as Constants from "./Constants";
import Trigger = Constants.Trigger;
import ModifierType = Constants.ModifierType;
import TriggerMoment = Constants.TriggerMoment;
import {Tier} from "./Constants";
import {ActiveFighter} from "./ActiveFighter";


export class BondageModifier extends Modifier {
    constructor(receiver:ActiveFighter, applier?:ActiveFighter, parentIds?:Array<string>) {
        super(receiver, applier, Tier.None, ModifierType.Bondage, 0, 0, 0, 0, 0, 1, Constants.TriggerMoment.Never, Constants.Trigger.None, parentIds, false);
    }
}

export class HoldModifier extends Modifier {
    constructor(receiver:ActiveFighter, applier:ActiveFighter, tier:Tier, holdType:ModifierType, hpDamage:number, lustDamage:number, focusDamage:number, parentIds?:Array<string>) {
        super(receiver, applier, tier, holdType, hpDamage, lustDamage, focusDamage, 0, 0, Constants.Fight.Action.Globals.initialNumberOfTurnsForHold, Constants.TriggerMoment.Any, Constants.Trigger.OnTurnTick, parentIds, false);
    }
}

export class LustBonusSexHoldModifier extends Modifier {
    constructor(receiver:ActiveFighter, parentIds?:Array<string>) {
        super(receiver, null, Tier.None, ModifierType.SexHoldLustBonus, 0, 0, 0, Constants.Fight.Action.Globals.accuracyForSexStrikeInsideSexHold, 0, Constants.Fight.Action.Globals.initialNumberOfTurnsForHold, Constants.TriggerMoment.Before, Constants.Trigger.SexStrikeAttack, parentIds, false);
    }
}

export class BrawlBonusSubHoldModifier extends Modifier {
    constructor(receiver:ActiveFighter, parentIds?:Array<string>) {
        super(receiver, null, Tier.None, ModifierType.SubHoldBrawlBonus, 0, 0, 0, Constants.Fight.Action.Globals.accuracyForBrawlInsideSubHold, 0, Constants.Fight.Action.Globals.initialNumberOfTurnsForHold, Constants.TriggerMoment.Before, Constants.Trigger.BrawlAttack, parentIds, false);
    }
}

export class ItemPickupModifier extends Modifier {
    constructor(receiver:ActiveFighter, parentIds?:Array<string>) {
        super(receiver, null, Tier.None, ModifierType.ItemPickupBonus, Constants.Fight.Action.Globals.itemPickupMultiplier, 0, 0, 0, 0, Constants.Fight.Action.Globals.itemPickupUses, Constants.TriggerMoment.After, Constants.Trigger.BrawlAttack, parentIds, true);
    }
}

export class SextoyPickupModifier extends Modifier {
    constructor(receiver:ActiveFighter, parentIds?:Array<string>) {
        super(receiver, null, Tier.None, ModifierType.SextoyPickupBonus, 0, 0, 0, 0, 0, Constants.Fight.Action.Globals.sextoyPickupUses, Constants.TriggerMoment.After, Constants.Trigger.SexStrikeAttack, parentIds, true);
    }
}

export class StrapToyModifier extends Modifier {
    constructor(receiver:ActiveFighter, turns:number, damagePerTurn:number, parentIds?:Array<string>) {
        super(receiver, null, Tier.None, ModifierType.StrapToy, 0, damagePerTurn, 0, 0, 0, turns, Constants.TriggerMoment.Any, Constants.Trigger.OnTurnTick, parentIds, true);
    }
}

export class DegradationModifier extends Modifier {
    constructor(receiver:ActiveFighter, applier:ActiveFighter, parentIds?:Array<string>) {
        super(receiver, applier, Tier.None, ModifierType.DegradationMalus, 0, 0, Constants.Fight.Action.Globals.degradationFocusDamage, 0, 0, Constants.Fight.Action.Globals.degradationUses, Constants.TriggerMoment.Before, Constants.Trigger.FocusDamage, parentIds, false);
    }
}

export class StunModifier extends Modifier {
    constructor(receiver:ActiveFighter, applier:ActiveFighter, dicePenalty:number, uses:number, parentIds?:Array<string>) {
        super(receiver, applier, Tier.None, ModifierType.Stun, 0, 0, 0, dicePenalty, dicePenalty, uses, Constants.TriggerMoment.Before, Constants.Trigger.AnyOffensiveAction, parentIds, false);
    }
}


export class DummyModifier extends Modifier {

    constructor(receiver:ActiveFighter, applier:ActiveFighter, modType:ModifierType, hpDamage:number, lustDamage:number, focusDamage:number, diceRoll:number, escapeRoll:number, uses:number,
                momentToTrigger:TriggerMoment, eventTrigger:Trigger, parentIds:Array<string>, areMultipliers:boolean){
        let myCustomNumberOfUses = 5;
        super(receiver, applier, Tier.None, modType, hpDamage, lustDamage, focusDamage, diceRoll, escapeRoll, myCustomNumberOfUses, momentToTrigger, eventTrigger, parentIds, areMultipliers);
    }

    trigger(moment: TriggerMoment, event:Trigger):void{
        if(this.willTriggerForEvent(moment, event)){
            //something else happens here
        }
    }
}