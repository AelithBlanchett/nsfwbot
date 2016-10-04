import Tiers = Constants.Tier;
export class Constants{
    static minLevel:number = 0;
    static maxLevelInit:number = 6;
    static maxLevel:number = 6;
    static maxTagBonus:number = 3;
    static tokensPerLossMultiplier:number = 0.5; //needs to be < 1 of course
    static tokensForWinnerByForfeitMultiplier:number = 0.5; //needs to be < 1 of course
    static turnsToWaitBetweenTwoTags:number = 4;
    static maxBondageItemsOnSelf:number = 3;
    static itemPickupMultiplier:number = 1.5;
    static sextoyPickupMultiplier:number = 1.5;
    static degradationFocusBonusDamage:number = 2;
    static difficultyIncreasePerBondageItem:number = 2;
    static itemPickupBonusUses:number = 1;
    static sextoyPickupBonusUses:number = 1;
    static degradationBonusUses:number = 1;
    static holdDamageMultiplier:number = 0.5;
    static accuracyBonusBrawlInsideSubHold:number = 3;
    static accuracyBonusSexStrikeInsideSexHold:number = 3;
    static initialNumberOfTurnsForHold:number = 5;
    static hpPercantageToHealOnRest:number = 0.25;
    static lpPercantageToHealOnRest:number = 0.25;
    static fpPointsToHealOnRest:number = 1;
    static maxTurnsWithoutFocus:number = 3;
    static forcedLewdPercentageOfLPRemoved:number = 3;

    public static get currencyName(): string    { return "tokens"; }
    public static get pluginName(): string    { return "nsfw"; }
    public static get fightTableName(): string    { return "nsfw_fights"; }
    public static get fightFightersTableName(): string    { return "nsfw_fightfighters"; }
    public static get fightersTableName(): string    { return "nsfw_fighters"; }
    public static get actionTableName(): string    { return "nsfw_actions"; }
    public static get finesseBonusAccuracy(): number    { return 1; }
    public static get finesseBonusText(): string    { return "+1 accuracy to all your attacks"; }
    public static get brawlerBonusDamage(): number    { return 2; }
    public static get brawlerBonusText(): string    { return "+2 HP damage to all your attacks"; }


    static startupGuide= `Note: Any commands written down there are starting with a ! and must be typed without the "".
    It's easy! First, you need to register.
    Just type "!register", and your profile will be created.
    You will have 1 point in every stat: Power, Sensuality, Toughness, Endurance, Dexterity, Willpower.

    Power will be used wear out the defender Physically with your strength, reducing their Health
    Sensuality will wear out the defender Sexually
    Toughness will help you resist Physical attacks by increasing your maximum Health
    Endurance will help you resist Sexual attacks, and increasing your Lust and Orgasm Counter
    Dexterity will help your moves to hit, help you to dodge attacks and influence your initiative
    Willpower will help you to keep your focus, and increase your Focus bar’s bounds

    Your overall Health is primarily determined by your Toughness plus a percentage of your overall stats.
    Your Lust and Orgasm Counter scales with the Endurance and also a percentage of your overall stats.

    Health works similarly to how Lust does.
    For your health, you will have 5 hearts, each representing 25 HP.
    For your lust, the hearts are replaced by the Orgasm Counter, and the HP by a Lust Counter.
    The Orgasm Counter will go up to X, this X being your Endurance.
    You will trigger an orgasm when you max your Lust Counter, which will reset back to 0, and removing one orgasm from your Orgasm Counter.
    No Hearts = No More Orgasms = You're out!
    `;
}

export module Constants{

    export class Modifier {
        static SubHoldBrawlBonus = "bonus on brawl attacks accuracy during a submission hold";
        static SubHold = "submission hold";
        static SexHoldLustBonus = "bonus on lust attacks accuracy during a sexual hold";
        static SexHold = "sexual hold";
        static Bondage = "bondage items";
        static HumHold = "humiliation hold";
        static DegradationMalus = "degradation malus";
        static ItemPickupBonus = "bonus damage on item pickup";
        static SextoyPickupBonus = "bonus lust damage on sextoy pickup";
    }

    export class Messages {
        static Ready = `[color=green]%s is now ready to get it on![/color]`;
    }

    export class SQL {
        static commitFightAction = "INSERT INTO `flistplugins`.?? (`idFight`,`atTurn`,`type`,`tier`,`isHold`,`diceScore`,`missed`,`idAttacker`,`idDefender`,`hpDamageToDef`,`lpDamageToDef`,`fpDamageToDef`,`hpDamageToAtk`,`lpDamageToAtk`,`fpDamageToAtk`,`hpHealToDef`,`lpHealToDef`,`fpHealToDef`,`hpHealToAtk`,`lpHealToAtk`,`fpHealToAtk`)\
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    }

    export enum ModifierType {
        SubHoldBrawlBonus = 0,
        SubHold = 1,
        SexHoldLustBonus = 2,
        SexHold = 3,
        Bondage = 4,
        HumHold = 5,
        DegradationMalus = 6,
        ItemPickupBonus = 7,
        SextoyPickupBonus = 8,
    }

    export enum Team {
        Unknown = -1,
        Blue = 0,
        Red = 1,
        Yellow = 2,
        Orange = 3,
        Pink = 4,
        Purple = 5
    }

    export enum Stats {
        Power = 0,
        Finesse = 1,
        Toughness = 2,
        Endurance = 3,
        Willpower = 4,
        Dexterity = 5
    }

    export enum Tier {
        None = -1,
        Light = 0,
        Medium = 1,
        Heavy = 2
    }

    export enum FightTier {
        Bronze = 0,
        Silver = 1,
        Gold = 2
    }

    export enum StatTier {
        Bronze = 2,
        Silver = 4,
        Gold = 6
    }

    export enum BaseDamage {
        Light = 4,
        Medium = 10,
        Heavy = 18
    }

    export enum FocusDamageHumHold {
        Light = 2,
        Medium = 3,
        Heavy = 4
    }

    export enum Action {
        Brawl,
        SexStrike,
        Tag,
        Rest,
        SubHold,
        SexHold,
        Bondage,
        HumHold,
        ItemPickup,
        SextoyPickup,
        Degradation,
        ForcedWorship
    }

    export enum TierDifficulty {
        Light = 4,
        Medium = 8,
        Heavy = 12
    }

    export enum TokensPerWin {
        Bronze = 13,
        Silver = 20,
        Gold = 50
    }

    export enum TokensWorth {
        Bronze = 100,
        Silver = 200,
        Gold = 600
    }

    export enum FightType {
        Classic = 0,
        Tag = 1
    }

    export const Arenas = [
        "The Pit",
        "Wrestling Ring",
        "Arena",
        "Subway",
        "Skyscraper Roof",
        "Forest",
        "Cafe",
        "Street road",
        "Alley",
        "Park",
        "MMA Hexagonal Cage",
        "Hangar",
        "Swamp",
        "Glass Box",
        "Free Space",
        "Magic Shop",
        "Public Restroom",
        "School",
        "Pirate Ship",
        "Baazar",
        "Supermarket",
        "Night Club",
        "Docks",
        "Hospital",
        "Dark Temple",
        "Restaurant Kitchen",
        "Graveyard",
        "Zoo",
        "Slaughterhouse",
        "Junkyard"
    ];

    export enum Trigger{
        None = 0,


        OnTurnTick,

        //Befores
        BeforeHPDamage,
        BeforeLustDamage,
        BeforeFocusDamage,
        BeforeDamage = BeforeHPDamage | BeforeLustDamage,
        BeforeBarDamage = BeforeHPDamage | BeforeLustDamage | BeforeFocusDamage,

        BeforeHPHealing,
        BeforeLustHealing,
        BeforeFocusHealing,
        BeforeHeal = BeforeHPHealing | BeforeLustHealing,
        BeforeBarHealing = BeforeHeal | BeforeFocusDamage,

        BeforeOrgasm,
        BeforeHeartLoss,
        BeforeOrgasmOrHeartLoss = BeforeOrgasm | BeforeHeartLoss,

        BeforeInitiationRoll,
        BeforeRoll = 1 | BeforeInitiationRoll,

        BeforeBrawlAttack,
        BeforeSexStrikeAttack,
        BeforeForcedWorshipAttack,
        BeforeSexHoldAttack,
        BeforeAttack = BeforeBrawlAttack | BeforeSexStrikeAttack | BeforeSexHoldAttack | BeforeForcedWorshipAttack,
        BeforeSubmissionHold,
        BeforeBondage,
        BeforeDegradation,
        BeforeHumiliationHold,
        BeforeHold = BeforeSubmissionHold | BeforeHumiliationHold,
        BeforePowerBasedAttack = BeforeBrawlAttack | BeforeSubmissionHold,

        BeforeItemPickup,
        BeforeSextoyPickup,
        BeforePickup = BeforeItemPickup | BeforeSextoyPickup,

        BeforeTag,
        BeforeEscape,
        BeforeRest,
        BeforePassiveAction = BeforeTag | BeforeEscape | BeforeRest,

        BeforePowerdrive,
        BeforePowerFantasy,
        BeforeSnapshot,
        BeforeKarmasutra,
        BeforeFinisher = BeforePowerdrive | BeforePowerFantasy | BeforeSnapshot | BeforeKarmasutra,

        BeforeUltimateHumiliation,
        BeforeAnyOffensiveAction = BeforeAttack | BeforeHold | BeforeFinisher,
        BeforeAnyAction = BeforePassiveAction | BeforeAnyOffensiveAction,




        //Afters
        AfterHPDamage,
        AfterLustDamage,
        AfterFocusDamage,
        AfterDamage = AfterHPDamage | AfterLustDamage,
        AfterBarDamage = AfterHPDamage | AfterLustDamage | AfterFocusDamage,

        AfterHPHealing,
        AfterLustHealing,
        AfterFocusHealing,
        AfterHeal = AfterHPHealing | AfterLustHealing,
        AfterBarHealing = AfterHeal | AfterFocusDamage,

        AfterOrgasm,
        AfterHeartLoss,
        AfterOrgasmOrHeartLoss = AfterOrgasm | AfterHeartLoss,

        AfterInitiationRoll,
        AfterRoll = 2 | AfterInitiationRoll,

        AfterBrawlAttack,
        AfterSexStrikeAttack,
        AfterForcedWorshipAttack,
        AfterSexHoldAttack,
        AfterAttack = AfterBrawlAttack | AfterSexStrikeAttack | AfterSexHoldAttack | AfterForcedWorshipAttack,
        AfterSubmissionHold,
        AfterBondage,
        AfterDegradation,
        AfterHumiliationHold,
        AfterHold = AfterSubmissionHold | AfterHumiliationHold,
        AfterPowerBasedAttack = AfterBrawlAttack | AfterSubmissionHold,

        AfterItemPickup,
        AfterSextoyPickup,
        AfterPickup = AfterItemPickup | AfterSextoyPickup,

        AfterTag,
        AfterEscape,
        AfterRest,
        AfterPassiveAction = AfterTag | AfterEscape | AfterRest,

        AfterPowerdrive,
        AfterPowerFantasy,
        AfterSnapshot,
        AfterKarmasutra,
        AfterFinisher = AfterPowerdrive | AfterPowerFantasy | AfterSnapshot | AfterKarmasutra,

        AfterUltimateHumiliation,
        AfterAnyOffensiveAction = AfterAttack | AfterHold | AfterFinisher,
        AfterAnyAction = AfterPassiveAction | AfterAnyOffensiveAction,
    }
}

