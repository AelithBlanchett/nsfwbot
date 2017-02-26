import {EnumEx} from "./Utils";
import {Fighter} from "./Fighter";
import {FightTier} from "./Constants";
import Knex = require("knex");
import {Model} from "./Model";

export class Achievement {
    type: AchievementType;
    reward: AchievementReward;
    name: string;
    description: AchievementDescription;
    condition: string;
    createdAt:Date;

    constructor(type: AchievementType, createdAt?:Date){
        this.type = type;
        this.name = AchievementReward[AchievementReward[AchievementType[type]]]; //short name, the enumerator's name in fact
        this.reward = AchievementReward[AchievementType[type]];
        this.description = AchievementDescription[AchievementType[type]];
        this.condition = AchievementCondition[AchievementType[type]];
        this.createdAt = createdAt || new Date();
    }

    static getAll():Achievement[]{
        let achievements:Achievement[] = [];
        let types = EnumEx.getValues(AchievementType);
        for(let type of types){
            achievements.push(new Achievement(type));
        }
        return achievements;
    }

    static checkAll(fighter:Fighter):string[]{
        let addedInfo = [];
        let achievements = Achievement.getAll();

        //useless statements to make sure typescript loads the FightTier class
        let x = FightTier.Bronze;

        for(let achievement of achievements){
            if(fighter.achievements.findIndex(x => x.type == achievement.type) == -1 && eval(achievement.condition)){ // super dangerous, I know
                fighter.achievements.push(achievement);
                fighter.giveTokens(achievement.reward);
                addedInfo.push(achievement.description + " Reward: "+ achievement.reward + " tokens.");
            }
        }
        return addedInfo;
    }
}

export enum AchievementCondition{
    Rookie = <any>"fighter.totalFights >= 1",
    FiveFights = <any>"fighter.totalFights >= 5",
    TenFights = <any>"fighter.totalFights >= 10",
    TwentyFights = <any>"fighter.totalFights >= 20",
    FortyFights = <any>"fighter.totalFights >= 40",
    WinFiveFights = <any>"fighter.wins >= 5",
    WinTenFights = <any>"fighter.wins >= 10",
    WinTwentyFights = <any>"fighter.wins >= 20",
    WinThirtyFights = <any>"fighter.wins >= 30",
    WinFortyFights = <any>"fighter.wins >= 40",
    ReachedSilver = <any>"fighter.tier() >= Constants_1.FightTier.Silver",
    ReachedGold = <any>"fighter.tier() >= Constants_1.FightTier.Gold"
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
    Rookie = 10,
    FiveFights = 50,
    TenFights = 100,
    TwentyFights = 150,
    FortyFights = 200,
    WinFiveFights = 50,
    WinTenFights = 100,
    WinTwentyFights = 200,
    WinThirtyFights = 300,
    WinFortyFights = 400,
    ReachedSilver = 100,
    ReachedGold = 200
}
//
// export enum AchievementReward {
//     Rookie = <any>"10 tokens",
//     FiveFights = <any>"50 tokens",
//     TenFights = <any>"100 tokens",
//     TwentyFights = <any>"150 tokens",
//     FortyFights = <any>"200 tokens",
//     WinFiveFights = <any>"50 tokens",
//     WinTenFights = <any>"100 tokens",
//     WinTwentyFights = <any>"200 tokens",
//     WinThirtyFights = <any>"300 tokens",
//     WinFortyFights = <any>"400 tokens",
//     ReachedSilver = <any>"100 tokens",
//     ReachedGold = <any>"200 tokens"
// }