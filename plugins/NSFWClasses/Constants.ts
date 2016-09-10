import Tiers = Constants.Tiers;
export class Constants{
    static minLevel:number = 0;
    static maxLevel:number = 6;

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

    export enum Tiers {
        Light = 0,
        Medium = 1,
        Heavy = 2
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
        BronzeTier = 12.5,
        SilverTier = 20,
        GoldTier = 50
    }

    export enum TokensWorth {
        BronzeToken = 100,
        SilverToken = 200,
        GoldToken = 600
    }
}

