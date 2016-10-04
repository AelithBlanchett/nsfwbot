import {Modifier} from "./Modifier";
import {Constants} from "./Constants";
import Trigger = Constants.Trigger;
import {Fighter} from "./Fighter";
import ModifierType = Constants.ModifierType;


export class BondageModifier extends Modifier {
    constructor(receiver: Fighter, applier?:Fighter, parentIds?:Array<string>){
        super(receiver, applier, ModifierType.Bondage, 0, 0, 0, 0, 0, 1, Constants.Trigger.None, parentIds, false);
    }
}

export class HoldModifier extends Modifier {
    constructor(receiver: Fighter, applier:Fighter, holdType:ModifierType, hpDamage:number, lustDamage:number, focusDamage:number, parentIds?:Array<string>){
        super(receiver, applier, holdType, hpDamage, lustDamage, focusDamage, 0, 0, Constants.initialNumberOfTurnsForHold, Constants.Trigger.OnTurnTick, parentIds, false);
    }
}

export class LustBonusSexHoldModifier extends Modifier {
    constructor(receiver: Fighter, parentIds?:Array<string>){
        super(receiver, null, ModifierType.SexHoldLustBonus, 0, 0, 0, Constants.accuracyBonusSexStrikeInsideSexHold, 0, Constants.initialNumberOfTurnsForHold, Constants.Trigger.BeforeSexStrikeAttack, parentIds, false);
    }
}

export class BrawlBonusSubHoldModifier extends Modifier {
    constructor(receiver: Fighter, parentIds?:Array<string>){
        super(receiver, null, ModifierType.SubHoldBrawlBonus, 0, 0, 0, Constants.accuracyBonusBrawlInsideSubHold, 0, Constants.initialNumberOfTurnsForHold, Constants.Trigger.BeforeBrawlAttack, parentIds, false);
    }
}

export class ItemPickupModifier extends Modifier {
    constructor(receiver: Fighter, parentIds?:Array<string>){
        super(receiver, null, ModifierType.ItemPickupBonus, Constants.itemPickupMultiplier, 0, 0, 0, 0, Constants.itemPickupBonusUses, Constants.Trigger.AfterBrawlAttack, parentIds, true);
    }
}

export class SextoyPickupModifier extends Modifier {
    constructor(receiver: Fighter, parentIds?:Array<string>){
        super(receiver, null, ModifierType.SextoyPickupBonus, 0, Constants.sextoyPickupMultiplier, 0, 0, 0, Constants.sextoyPickupBonusUses, Constants.Trigger.AfterBrawlAttack, parentIds, true);
    }
}

export class DegradationModifier extends Modifier {
    constructor(receiver: Fighter, applier:Fighter, parentIds?:Array<string>){
        super(receiver, applier, ModifierType.DegradationMalus, 0, 0, Constants.degradationFocusBonusDamage, 0, 0, Constants.degradationBonusUses, Constants.Trigger.BeforeFocusDamage, parentIds, false);
    }
}

export class StunModifier extends Modifier {
    constructor(receiver: Fighter, applier:Fighter, dicePenalty:number, uses:number, parentIds?:Array<string>){
        super(receiver, applier, ModifierType.Stun, 0, 0, 0, dicePenalty, dicePenalty, uses, Constants.Trigger.BeforeAnyOffensiveAction, parentIds, false);
    }
}


export class DummyModifier extends Modifier {

    constructor(receiver:Fighter, applier:Fighter, modType:ModifierType, hpDamage:number, lustDamage:number, focusDamage: number, diceRoll: number, escapeRoll: number, uses:number,
                eventTrigger:Trigger, parentIds:Array<string>, areMultipliers:boolean){
        let myCustomNumberOfUses = 5;
        super(receiver, applier, modType, hpDamage, lustDamage, focusDamage, diceRoll, escapeRoll, myCustomNumberOfUses, eventTrigger, parentIds, areMultipliers);
    }

    trigger(event:Trigger):void{
        if(this.willTriggerForEvent(event)){
            //something else happens here
        }
    }
}