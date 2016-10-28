export class Globals {
    public static pluginName: string = "nsfw";
    public static currencyName: string = "tokens";
}

export class SQL {
    public static commitFightAction = "INSERT INTO `flistplugins`.?? (`idFight`,`atTurn`,`type`,`tier`,`isHold`,`diceScore`,`missed`,`idAttacker`,`idDefender`,`hpDamageToDef`,`lpDamageToDef`,`fpDamageToDef`,`hpDamageToAtk`,`lpDamageToAtk`,`fpDamageToAtk`,`hpHealToDef`,`lpHealToDef`,`fpHealToDef`,`hpHealToAtk`,`lpHealToAtk`,`fpHealToAtk`)\
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    public static fightTableName: string = "nsfw_fights";
    public static fightFightersTableName: string = "nsfw_fightfighters";
    public static fightersTableName: string = "nsfw_fighters";
    public static actionTableName: string = "nsfw_actions";
}

export class Fighter {
    public static minLevel: number = 1;
    public static maxLevel: number = 6;
}

export namespace Fight {

    export class Globals {
        public static tokensPerLossMultiplier: number = 0.5; //needs to be < 1 of course
        public static tokensForWinnerByForfeitMultiplier: number = 0.5; //needs to be < 1 of course
    }

    export namespace Action {
        export class RequiredScore{
            public static Tag: number = 8;
            public static Rest: number = 4;
        }

        export class Globals{
            //Tag
            public static turnsToWaitBetweenTwoTags: number = 4;
            //Bondage
            public static maxBondageItemsOnSelf: number = 3;
            public static difficultyIncreasePerBondageItem: number = 2;
            //Focus
            public static maxTurnsWithoutFocus: number = 3;
            //Holds
            public static initialNumberOfTurnsForHold: number = 5;
            public static holdDamageMultiplier: number = 0.5;
            //Rest
            public static hpPercentageToHealOnRest: number = 0.25;
            public static lpPercentageToHealOnRest: number = 0.25;
            public static fpPointsToHealOnRest: number = 1;
            //Forced Lewd
            public static forcedLewdPercentageOfLPRemoved: number = 3;
            //HighRisk
            public static multiplierHighRiskAttack: number = 2;
            //Stun
            public static stunPowerDivider: number = 2;
            public static dicePenaltyMultiplierWhileStunned: number = 3;



            //Bonuses
            public static maxTagBonus: number = 3;

            public static itemPickupUses: number = 1;
            public static itemPickupMultiplier: number = 1.5;

            public static sextoyPickupUses: number = 1;
            public static sextoyPickupMultiplier: number = 1.5;

            public static degradationUses: number = 1;
            public static degradationFocusDamage: number = 2;

            public static accuracyForBrawlInsideSubHold: number = 3;
            public static accuracyForSexStrikeInsideSexHold: number = 3;
        }
    }
}



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
    static Stun = "stun malus";
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
    Stun = 9,
    StrapToy = 10,
}

export class Achievement {
    static Rookie = "Win your first fight!";
    static FiveFights = "Participate in 5 Fights";
    static TenFights = "Participate in 10 fights";
    static TwentyFights = "Participate in 20 fights";
    static FortyFights = "Participate in 40 fights";
    static WinFiveFights = "Win 5 Fights";
    static WinTenFights = "Win 10 fights";
    static WinTwentyFights = "Win 20 fights";
    static WinThirtyFights = "Win 30 fights";
    static WinFortyFights = "Win 40 fights";
    static ReachedSilver = "Reached Silver Tier";
    static ReachedGold = "Reached Gold Tier";
}

export enum AchievementType {
    Rookie = 0,
    FiveFights = 1,
    TenFights = 2,
    TwentyFights = 3,
    FortyFights = 4,
    WinFiveFights = 5,
    WinTenFights = 6,
    WinTwentyFights = 7,
    WinThirtyFights = 8,
    WinFortyFights = 9,
    ReachedSilver = 10,
    ReachedGold = 11
}

export class AchievementReward {
    static Rookie = "10 tokens";
    static FiveFights = "50 tokens";
    static TenFights = "100 tokens";
    static TwentyFights = "150 tokens";
    static FortyFights = "200 tokens";

    static WinFiveFights = "50 tokens";
    static WinTenFights = "100 tokens";
    static WinTwentyFights = "200 tokens";
    static WinThirtyFights = "300 tokens";
    static WinFortyFights = "400 tokens";
    static ReachedSilver = "100 tokens";
    static ReachedGold = "200 tokens";
}

export class Feature {
    static KickStart = "Kick Start";
    static SexyKickStart = "Sexy Kick Start";
    static Sadist = "Sadist";
    static CumSlut = "Cum Slut";
    static RyonaEnthusiast = "Ryona Enthusiast";
    static DomSubLover = "Dom Sub Lover";
}

export enum FeatureType {
    KickStart = 0,
    SexyKickStart = 1,
    Sadist = 2,
    CumSlut = 3,
    RyonaEnthusiast = 4,
    DomSubLover = 5
}

export class FeatureExplain {
    static KickStart = "They start with an offensive item in their hand, meaning to do more damage.";
    static SexyKickStart = "They start with a sextoy in their hand, meaning to do more lust damage.";
    static Sadist = "Dealing HP damage to the opponent will deal the same amount divided by two to the wearer's Lust.";
    static CumSlut = "Increases all Lust damage done to the wearer by 3.";
    static RyonaEnthusiast = "Taking HP damage also increases the wearer's Lust by the same amount divided by two.";
    static DomSubLover = "Replaces focus by submissiveness. Purely visual.";
}

export class Messages {
    static startupGuide = `Note: Any commands written down there are starting with a ! and must be typed without the "".
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
    static Ready = `[color=green]%s is now ready to get it on![/color]`;
    static HitMessage = ` HIT! `;
    static changeMinTeamsInvolvedInFightOK = "Number of teams involved in the fight updated!.";
    static changeMinTeamsInvolvedInFightFail = "The number of teams should be superior or equal than 2.";
    static setFightTypeRumble = "Fight type successfully set to Rumble.";
    static setFightTypeTag = "Fight type successfully set to Tag-Team.";
    static setFightTypeLMS = "Fight type successfully set to Last Man Standing.";
    static setFightTypeHMatch = "Fight type successfully set to Humiliation Match.";
    static setFightTypeSexFight = "Fight type successfully set to SexFight.";
    static setFightTypeBondageMatch = "Fight type successfully set to SexFight.";
    static setFightTypeNotFound = "Type not found. Fight type resetted to Rumble.";
    static setFightTypeFail = "Can't change the fight type if the fight has already started or is already finished.";

    static startMatchAnnounce = "[color=green]Everyone's ready, let's start the match![/color]";
    static startMatchStageAnnounce = "The fighters will meet in the... [color=red][b]%s![/b][/color]";
    static startMatchFirstPlayer = "%s starts first for the [color=%s]%s[/color] team!";
    static startMatchFollowedBy = "%s will follow for the [color=%s]%s[/color] team.";

    static outputStatusInfo = `[b]Turn #%s[/b] [color=%s]------ %s team ------[/color] It's [u]%s[/u]'s turn.\n`;

    static setCurrentPlayerOK = `Successfully changed %s's place with %s's!`;
    static setCurrentPlayerFail = "Couldn't switch the two wrestlers. The name is either wrong, this fighter is already in the ring or this fighter isn't able to fight right now.";

    static rollAllDiceEchoRoll = "%s rolled a %s";

    static canAttackNoAction = `The last action hasn't been processed yet.`;
    static canAttackNotWaitingForAction = `The last action hasn't been processed yet.`;
    static canAttackIsOut = `You are out of this fight.`;
    static canAttackIsOutOfTheRing = `You cannot do that since you're not inside the ring.`;
    static canAttackTargetIsOutOfTheRing = `Your target isn't inside the ring.`;
    static canAttackTargetOutOfFight = `Your target is out of this fight.`;
    static canAttackIsInHold = `You cannot do that since you're in a hold.`;

    static checkAttackRequirementsNotInSexualHold = `You cannot do that since your target is not in a sexual hold.`;

    static doActionNotActorsTurn = `This isn't your turn.`;
    static doActionTargetIsSameTeam = "The target for this attack can't be in your team.";

    static forfeitItemApply = `%s forfeits! Which means... 3 bondage items landing on them to punish them!`;
    static forfeitTooManyItems = `%s has too many items on them to possibly fight! [b][color=red]They're out![/color][/b]`;
    static forfeitAlreadyOut = `You are already out of the match. No need to give up.`;

    static tapoutMessage = `%s couldn't handle it anymore! They SUBMIT!`;

    static finishMessage = `%s couldn't fight against that! They're out!`;

    static checkForDrawOK = `Everybody agrees, it's a draw!`;
    static checkForDrawWaiting = `Waiting for the other players still in the fight to call the draw.`;
    static endFightAnnounce = "%s team wins the fight!";

    static wrongMatchTypeForAction = "You can't %s in a %s match.";
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
    Sensuality = 1,
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

export enum HighRiskMultipliers {
    Light = 2,
    Medium = 1.5,
    Heavy = 1.2
}

export enum StatTier {
    Bronze = 2,
    Silver = 4,
    Gold = 6
}

export enum BaseDamage {
    Light = 4,
    Medium = 12,
    Heavy = 20
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
    ForcedWorship,
    HighRisk,
    Penetration,
    Stun,
    Escape,
    Submit,
    StrapToy,
    Finish,
    Masturbate
}

export enum StrapToyLPDamagePerTurn {
    Light = 2,
    Medium = 3,
    Heavy = 4
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
    Rumble = 0,
    Tag = 1,
    LastManStanding = 2,
    SexFight = 3,
    Humiliation = 4,
    Tables = 5,
    Bondage = 6,
    Submission = 7
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

export const finishers = [
    "Cum on the loser's face",
    "Tombstone Piledriver into the mats",
    "Make the loser lick the mats",
    "Smother"
];

export enum TriggerMoment {
    Never = -1,
    Before = 1 << 0,
    After = 1 << 1,
    Any = Before | After
}

export enum Trigger {
    HPDamage = 1 << 0,
    LustDamage = 1 << 1,
    FocusDamage = 1 << 2,
    Damage = HPDamage | LustDamage,
    BarDamage = HPDamage | LustDamage | FocusDamage,

    HPHealing = 1 << 3,
    LustHealing = 1 << 4,
    FocusHealing = 1 << 5,
    Heal = HPHealing | LustHealing,
    BarHealing = Heal | FocusDamage,

    Orgasm = 1 << 6,
    HeartLoss = 1 << 7,
    OrgasmOrHeartLoss = Orgasm | HeartLoss,

    InitiationRoll = 1 << 8,
    SingleRoll = 1 << 9,
    Roll = SingleRoll | InitiationRoll,

    BrawlAttack = 1 << 10,
    SexStrikeAttack = 1 << 11,
    ForcedWorshipAttack = 1 << 12,
    HighRiskAttack = 1 << 13,
    Penetration = 1 << 14,
    Stun = 1 << 15,
    Attack = BrawlAttack | SexStrikeAttack | ForcedWorshipAttack | Stun,
    SubmissionHold = 1 << 16,
    Bondage = 1 << 17,
    Degradation = 1 << 18,
    HumiliationHold = 1 << 19,
    SexHoldAttack = 1 << 20,
    Hold = SubmissionHold | HumiliationHold | SexHoldAttack,
    PowerBasedAttack = BrawlAttack | SubmissionHold | HighRiskAttack | Stun,

    ItemPickup = 1 << 21,
    SextoyPickup = 1 << 22,
    Pickup = ItemPickup | SextoyPickup,

    Tag = 1 << 23,
    Escape = 1 << 24,
    Rest = 1 << 25,
    Submit = 1 << 27,
    PassiveAction = Tag | Escape | Rest,
    AnyOffensiveAction = Attack | Hold,
    AnyAction = PassiveAction | AnyOffensiveAction,

    OnTurnTick = 1 << 28,
    None = 1 << 29,

    StrapToy = 1 << 30,
    Finisher = 1 << 31
}
