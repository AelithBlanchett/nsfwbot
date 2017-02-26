import {Feature} from "./Feature";
import {IFighter} from "./interfaces/IFighter";
import {Achievement} from "./Achievement";
import {AchievementType} from "./Achievement";
import {FeatureType, Team} from "./Constants";
import * as Constants from "./Constants";
import {TokensWorth} from "./Constants";
import {Stats} from "./Constants";
import {FightTier} from "./Constants";
import {Fight} from "./Fight";
import {FighterRepository} from "./FighterRepository";

export class Fighter{

    name:string = "";
    areStatsPrivate:boolean = true;

    dexterity:number = 1;
    power:number = 1;
    sensuality:number = 1;
    toughness:number = 1;
    endurance:number = 1;
    willpower:number = 1;

    tokens: number = 0;
    tokensSpent: number = 0;

    fightsCount:number;
    fightsCountCS:number;
    losses:number;
    lossesSeason:number;
    wins:number;
    winsSeason:number;
    currentlyPlaying:number;
    currentlyPlayingSeason:number;
    fightsPendingReady:number;
    fightsPendingReadySeason:number;
    fightsPendingStart:number;
    fightsPendingStartSeason:number;
    fightsPendingDraw:number;
    fightsPendingDrawSeason:number;
    favoriteTeam:Team;
    favoriteTagPartner:string;
    timesFoughtWithFavoriteTagPartner:number;
    nemesis:string;
    lossesAgainstNemesis:number;
    averageDiceRoll:number;
    missedAttacks:number;
    actionsCount:number;
    actionsDefended:number;
    brawlAtksCount:number;
    sexstrikesCount:number;
    tagsCount:number;
    restCount:number;
    subholdCount:number;
    sexholdCount:number;
    bondageCount:number;
    humholdCount:number;
    itemPickups:number;
    sextoyPickups:number;
    degradationCount:number;
    forcedWorshipCount:number;
    highRiskCount:number;
    penetrationCount:number;
    stunCount:number;
    escapeCount:number;
    submitCount:number;
    straptoyCount:number;
    finishCount:number;
    masturbateCount:number;

    matchesInLast24Hours:number;
    matchesInLast48Hours:number;

    elo:number;
    globalRank:number;

    forfeits;
    quits;

    features:Feature[] = [];
    achievements:Achievement[] = [];
    createdAt:Date;
    updatedAt:Date;
    deletedAt:Date;

    addAchievement(type:AchievementType){
        let added = false;
        let index = this.achievements.findIndex(x => x.type == type);
        if(index == -1){
            this.achievements.push(new Achievement(type));
            added = true;
        }
        return added;
    }

    checkAchievements(){
        let strBase = "Achievements won: ";
        let added = Achievement.checkAll(this);

        if(added.length > 0){
            strBase += added.join("\n");
        }
        else{
            strBase = "";
        }

        return strBase + "\n";
    }

    winRate():number{
        let winRate = 0.00;
        if(this.fightsCount > 0 && this.wins > 0){
            winRate = this.fightsCount/this.wins;
        }
        else if(this.fightsCount > 0 && this.losses > 0){
            winRate = 1 - this.fightsCount/this.losses;
        }
        return winRate;
    }

    totalHp():number{
        let hp = 100;
        if (this.toughness > 35) {
            hp += (this.toughness - 35);
        }
        return hp;
    }

    hpPerHeart():number {
        return Math.ceil(this.totalHp() / this.maxHearts());
    }

    maxHearts():number {
        return 3;
    }

    totalLust():number{
        let lust = 100;
        if (this.endurance > 35) {
            lust += (this.endurance - 35);
        }
        return lust;
    }

    lustPerOrgasm():number {
        return Math.ceil(this.totalLust() / this.maxOrgasms());
    }

    maxOrgasms():number {
        return 3;
    }

    minFocus():number {
        return -20 - this.focusResistance();
    }

    focusResistance():number{
        let resistance = 0;
        if (this.willpower > 30) {
            resistance += (this.willpower - 30);
        }
        return resistance;
    }

    maxFocus():number {
        return 20 + this.focusResistance();
    }

    outputStats():string{
        return "[b]" + this.name + "[/b]'s stats" + "\n" +
            "[b][color=red]Power[/color][/b]:  " + this.power + "      " + "    --            [b][color=red]Hearts[/color][/b]: " + this.maxHearts() + " * " + this.hpPerHeart() +" [b][color=red]HP[/color] per heart[/b]"+"\n" +
            "[b][color=orange]Sensuality[/color][/b]:  " + this.sensuality + "      " + "[b][color=pink]Orgasms[/color][/b]: " + this.maxOrgasms() + " * " + this.lustPerOrgasm() +" [b][color=pink]Lust[/color] per Orgasm[/b]"+"\n" +
            "[b][color=green]Toughness[/color][/b]: " + this.toughness + "\n" +
            "[b][color=cyan]Endurance[/color][/b]: " + this.endurance + "      " + "[b][color=green]Win[/color]/[color=red]Loss[/color] record[/b]: " + this.wins + " - " + this.losses + "\n" +
            "[b][color=purple]Dexterity[/color][/b]: " + this.dexterity +  "      " + "[b][color=orange]Bronze tokens available[/color][/b]: " + this.bronzeTokens() +  " " + "[b][color=grey]Silver[/color][/b]: " + this.silverTokens() +  " " + "[b][color=yellow]Gold[/color][/b]: " + this.goldTokens() + "\n" +
            "[b][color=blue]Willpower[/color][/b]: " + this.willpower +  "      " + "[b][color=orange]Total tokens[/color][/b]: " + this.tokens + "         [b][color=orange]Total spent[/color][/b]: "+this.tokensSpent+"\n"  +
            "[b][color=red]Features[/color][/b]: [b]" + this.getFeaturesList() + "[/b]\n" +
            "[b][color=yellow]Achievements[/color][/b]: [b]" + this.getAchievementsList() + "[/b]";
    }

    getFeaturesList(){
        let strResult = [];
        for(let feature of this.features){
            strResult.push(`${Feature[FeatureType[feature.type]]} - ${feature.uses} uses left`);
        }
        return strResult.join(", ");
    }

    getAchievementsList(){
        let strResult = [];
        for(let achievement of this.achievements){
            strResult.push(`${achievement.description}`);
        }
        return strResult.join(", ");
    }

    bronzeTokens():number{
        return Math.floor(this.tokens/TokensWorth.Bronze);
    }

    silverTokens():number{
        return Math.floor(this.tokens/TokensWorth.Silver);
    }

    goldTokens():number{
        return Math.floor(this.tokens/TokensWorth.Gold);
    }

    async removeFeature(type:FeatureType):Promise<void>{
        let index = this.features.findIndex(x => x.type == type);
        if(index != -1){
            this.features.splice(index, 1);
            await FighterRepository.persist(this);
        }
        else{
            throw new Error("You don't have this feature, you can't remove it.");
        }
    }

    addFeature(type:FeatureType, turns:number){
        let feature = new Feature(this.name, type, turns);
        let amountToRemove = feature.getCost();

        if(this.tokens - amountToRemove >= 0){
            let index = this.features.findIndex(x => x.type == type);
            if(index == -1){
                this.features.push(feature);
                this.removeTokens(amountToRemove);
                FighterRepository.persist(this);
            }
            else{
                throw new Error("You already have this feature. You have to wait for it to expire before adding another of the same type.");
            }
        }
        else{
            throw new Error(`Not enough tokens. Required: ${amountToRemove}.`);
        }
    }

    clearFeatures(){
        this.features = [];
        FighterRepository.persist(this);
    }

    hasFeature(featureType:FeatureType):boolean{
        return this.features.findIndex(x => x.type == featureType) != -1;
    }

    restat(power:number, sensuality:number, toughness:number, endurance:number, dexterity:number, willpower:number):boolean{
        this.dexterity = dexterity;
        this.power = power;
        this.sensuality = sensuality;
        this.toughness = toughness;
        this.endurance = endurance;
        this.willpower = willpower;

        FighterRepository.persist(this);

        return true;
    }

    // addStat(stat:Stats):any{
    //     let theStat = this[Stats[stat].toLowerCase()];
    //     theStat++;
    //     if(theStat > Constants.Fighter.maxLevel){
    //         return "You can't increase this stat anymore.";
    //     }
    //     let statTier = this.tier();
    //     let amountToRemove = 0;
    //     if(statTier == FightTier.Bronze){
    //         amountToRemove = TokensWorth.Bronze;
    //     }
    //     else if(statTier == FightTier.Silver){
    //         amountToRemove = TokensWorth.Silver;
    //     }
    //     else if(statTier == FightTier.Gold){
    //         amountToRemove = TokensWorth.Gold;
    //     }
    //     else if(statTier == -1){
    //         return "Tier not found.";
    //     }
    //
    //     if(amountToRemove != 0 && (this.tokens - amountToRemove >= 0)){
    //         this.removeTokens(amountToRemove);
    //         this[Stats[stat].toLowerCase()]++;
    //         FighterRepository.persist(this);
    //         return "";
    //     }
    //     else{
    //         return `Not enough ${FightTier[statTier]} tokens`;
    //     }
    // }
    //
    // removeStat(stat:Stats):any{
    //     let theStat = this[Stats[stat].toLowerCase()];
    //     theStat--;
    //     if(theStat < Constants.Fighter.minLevel){
    //         return "You can't decrease this stat anymore.";
    //     }
    //     let statTier = this.tier();
    //     let amountToGive = 0;
    //     if(statTier == FightTier.Bronze){
    //         amountToGive = TokensWorth.Bronze;
    //     }
    //     else if(statTier == FightTier.Silver){
    //         amountToGive = TokensWorth.Silver;
    //     }
    //     else if(statTier == FightTier.Gold){
    //         amountToGive = TokensWorth.Gold;
    //     }
    //     else{
    //         return "Tier not found.";
    //     }
    //
    //     if(amountToGive != 0){
    //         this.giveTokens(Math.floor(amountToGive/2));
    //         this[Stats[stat].toLowerCase()]--;
    //         FighterRepository.persist(this);
    //         return "";
    //     }
    //     else{
    //         return "The number of tokens to give back was miscalculated, request denied.";
    //     }
    // }

    giveTokens(amount){
        this.tokens += amount;
    }

    removeTokens(amount){
        this.tokens -= amount;
        this.tokensSpent += amount;
        if(this.tokens < 0){
            this.tokens = 0;
        }
    }

    tier():FightTier{
        if(this.wins < 10){
            return FightTier.Bronze;
        }
        else if(this.wins < 30){
            return FightTier.Silver
        }
        else if(this.wins >= 30){
            return FightTier.Gold;
        }
        return FightTier.Bronze;
    }

}