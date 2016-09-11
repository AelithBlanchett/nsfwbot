import Tiers = Constants.Tier;
export class Constants{
    static minLevel:number = 0;
    static maxLevel:number = 6;
    static tokensPerLossMultiplier:number = 0.5; //needs to be < 1 of course

    public static get pluginName(): string    { return "nsfw"; }
    public static get fightTableName(): string    { return "nsfw_fights"; }
    public static get fightFightersTableName(): string    { return "nsfw_fightfighters"; }
    public static get fightersTableName(): string    { return "nsfw_fighters"; }
    public static get actionTableName(): string    { return "nsfw_actions"; }
}

export module Constants{


    export enum Team {
        Unknown = -1,
        Blue = 0,
        Red = 1,
        Yellow = 2,
        Orange = 3,
        Pink = 4,
        Purple = 5
    }

    export enum Tier {
        Light = 0,
        Medium = 1,
        Heavy = 2
    }

    export enum FightTier {
        Bronze = 0,
        Silver = 1,
        Gold = 2
    }

    export enum BaseDamage {
        Light = 6,
        Medium = 12,
        Heavy = 18
    }

    export enum RequiredRoll {
        Light = 4,
        Medium = 8,
        Heavy = 12
    }

    export enum TokensPerWin {
        Bronze = 12.5,
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
}

