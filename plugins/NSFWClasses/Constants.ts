import Tiers = Constants.Tier;
export class Constants{
    static minLevel:number = 0;
    static maxLevelInit:number = 6;
    static maxLevel:number = 6;
    static maxTagBonus:number = 3;
    static tokensPerLossMultiplier:number = 0.5; //needs to be < 1 of course
    static turnsToWaitBetweenTwoTags:number = 4;
    static maxBondageItemsOnSelf:number = 3;

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
        Willpower = 4
    }

    export enum Affinity {
        Power = 0,
        Finesse = 1
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
        Light = 6,
        Medium = 12,
        Heavy = 18
    }

    export enum Action {
        Brawl,
        SexStrike,
        Tag,
        Pass,
        SubHold,
        SexHold,
        Bondage,
        HumHold,
        ItemPickup,
        SextoyPickup,
        Degradation
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

        //Befores
        BeforeTurnTick,

        BeforeHPDamage,
        BeforeLustDamage,
        BeforeFocusDamage,
        BeforeDamage = BeforeHPDamage | BeforeLustDamage,
        BeforeBarDamage = BeforeHPDamage | BeforeLustDamage | BeforeFocusDamage,

        BeforeOrgasm,
        BeforeHeartLoss,
        BeforeOrgasmOrHeartLoss = BeforeOrgasm | BeforeHeartLoss,

        BeforeInitiationRoll,
        BeforeRoll = 1 | BeforeInitiationRoll,

        BeforeBrawlAttack,
        BeforeSexStrikeAttack,
        BeforeSexHoldAttack,
        BeforeAttack = BeforeBrawlAttack | BeforeSexStrikeAttack | BeforeSexHoldAttack,
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
        BeforePass,
        BeforePassiveAction = BeforeTag | BeforeEscape | BeforePass,

        BeforePowerdrive,
        BeforePowerFantasy,
        BeforeSnapshot,
        BeforeKarmasutra,
        BeforeFinisher = BeforePowerdrive | BeforePowerFantasy | BeforeSnapshot | BeforeKarmasutra,

        BeforeUltimateHumiliation,
        BeforeAnyOffensiveAction = BeforeAttack | BeforeHold | BeforeFinisher,
        BeforeAnyAction = BeforePassiveAction | BeforeAnyOffensiveAction,




        //Afters
        AfterTurnTick,

        AfterHPDamage,
        AfterLustDamage,
        AfterFocusDamage,
        AfterDamage = AfterHPDamage | AfterLustDamage,
        AfterBarDamage = AfterHPDamage | AfterLustDamage | AfterFocusDamage,

        AfterOrgasm,
        AfterHeartLoss,
        AfterOrgasmOrHeartLoss = AfterOrgasm | AfterHeartLoss,

        AfterInitiationRoll,
        AfterRoll = 2 | AfterInitiationRoll,

        AfterBrawlAttack,
        AfterSexStrikeAttack,
        AfterSexHoldAttack,
        AfterAttack = AfterBrawlAttack | AfterSexStrikeAttack | AfterSexHoldAttack,
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
        AfterPass,
        AfterPassiveAction = AfterTag | AfterEscape | AfterPass,

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

