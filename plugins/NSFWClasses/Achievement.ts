export class Achievement {
    type: AchievementType;
    reward: AchievementReward;
    name: string;
    description: AchievementDescription;

    constructor(type: AchievementType){
        this.type = type;
        this.name = AchievementReward[AchievementReward[AchievementType[type]]]; //short name, the enumerator's name in fact
        this.reward = AchievementReward[AchievementType[type]];
        this.description = AchievementDescription[AchievementType[type]];
    }
}

export enum AchievementDescription{
    Rookie = <any>"Win your first fight!",
    FiveFights = <any>"Participate in 5 Fights",
    TenFights = <any>"Participate in 10 fights",
    TwentyFights = <any>"Participate in 20 fights",
    FortyFights = <any>"Participate in 40 fights",
    WinFiveFights = <any>"Win 5 Fights",
    WinTenFights = <any>"Win 10 fights",
    WinTwentyFights = <any>"Win 20 fights",
    WinThirtyFights = <any>"Win 30 fights",
    WinFortyFights = <any>"Win 40 fights",
    ReachedSilver = <any>"Reached Silver Tier",
    ReachedGold = <any>"Reached Gold Tier"
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

export enum AchievementReward {
    Rookie = <any>"10 tokens",
    FiveFights = <any>"50 tokens",
    TenFights = <any>"100 tokens",
    TwentyFights = <any>"150 tokens",
    FortyFights = <any>"200 tokens",
    WinFiveFights = <any>"50 tokens",
    WinTenFights = <any>"100 tokens",
    WinTwentyFights = <any>"200 tokens",
    WinThirtyFights = <any>"300 tokens",
    WinFortyFights = <any>"400 tokens",
    ReachedSilver = <any>"100 tokens",
    ReachedGold = <any>"200 tokens"
}