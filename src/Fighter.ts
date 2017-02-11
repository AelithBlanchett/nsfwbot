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

export class Fighter implements IFighter{

    name:string = "";
    areStatsPrivate:boolean = true;

    dexterity:number = 0;
    power:number = 0;
    sensuality:number = 0;
    toughness:number = 0;
    endurance:number = 0;
    willpower:number = 0;

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

    constructor(name:string) {
        this.name = name;
    }

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
            strBase += added.join(", ");
        }
        else{
            strBase = "";
        }

        return strBase;
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

    hpPerHeart():number {
        return 35;
    }

    maxHearts():number {
        let heartsSup = Math.ceil(this.toughness / 2);
        return 4 + heartsSup;
    }

    lustPerOrgasm():number {
        return 35;
    }

    maxOrgasms():number {
        let orgasmsSup = Math.ceil(this.endurance / 2);
        return 4 + orgasmsSup;
    }

    minFocus():number {
        return -2 - this.willpower;
    }

    maxFocus():number {
        return 2 + this.willpower;
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

    removeFeature(type:FeatureType):void{
        let index = this.features.findIndex(x => x.type == type);
        if(index != -1){
            this.features.splice(index, 1);
            Fighter.save(this);
        }
        else{
            throw new Error("You don't have this feature, you can't remove it.");
        }
    }

    addFeature(type:FeatureType, turns:number){
        let feature = new Feature(this, type, turns);
        let amountToRemove = feature.getCost();

        if(this.tokens - amountToRemove >= 0){
            let index = this.features.findIndex(x => x.type == type);
            if(index == -1){
                this.features.push(feature);
                this.removeTokens(amountToRemove);
                Fighter.save(this);
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
        Fighter.save(this);
    }

    hasFeature(featureType:FeatureType):boolean{
        return this.features.findIndex(x => x.type == featureType) != -1;
    }

    addStat(stat:Stats):any{
        let theStat = this[Stats[stat].toLowerCase()];
        theStat++;
        if(theStat > Constants.Fighter.maxLevel){
            return "You can't increase this stat anymore.";
        }
        let statTier = this.tier(+1);
        let amountToRemove = 0;
        if(statTier == FightTier.Bronze){
            amountToRemove = TokensWorth.Bronze;
        }
        else if(statTier == FightTier.Silver){
            amountToRemove = TokensWorth.Silver;
        }
        else if(statTier == FightTier.Gold){
            amountToRemove = TokensWorth.Gold;
        }
        else if(statTier == -1){
            return "Tier not found.";
        }

        if(amountToRemove != 0 && (this.tokens - amountToRemove >= 0)){
            this.removeTokens(amountToRemove);
            this[Stats[stat].toLowerCase()]++;
            Fighter.save(this);
            return "";
        }
        else{
            return `Not enough ${FightTier[statTier]} tokens`;
        }
    }

    removeStat(stat:Stats):any{
        let theStat = this[Stats[stat].toLowerCase()];
        theStat--;
        if(theStat < Constants.Fighter.minLevel){
            return "You can't decrease this stat anymore.";
        }
        let statTier = this.tier(-1);
        let amountToGive = 0;
        if(statTier == FightTier.Bronze){
            amountToGive = TokensWorth.Bronze;
        }
        else if(statTier == FightTier.Silver){
            amountToGive = TokensWorth.Silver;
        }
        else if(statTier == FightTier.Gold){
            amountToGive = TokensWorth.Gold;
        }
        else{
            return "Tier not found.";
        }

        if(amountToGive != 0){
            this.giveTokens(Math.floor(amountToGive/2));
            this[Stats[stat].toLowerCase()]--;
            Fighter.save(this);
            return "";
        }
        else{
            return "The number of tokens to give back was miscalculated, request denied.";
        }
    }

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

    tier(offset:number = 0):FightTier{
        if((this.power + this.sensuality + this.dexterity + this.toughness + this.endurance + this.willpower) + offset <= 12){
            return FightTier.Bronze;
        }
        else if((this.power + this.sensuality + this.dexterity + this.toughness + this.endurance + this.willpower) + offset <= 24){
            return FightTier.Silver;
        }
        else if((this.power + this.sensuality + this.dexterity + this.toughness + this.endurance + this.willpower) + offset <= 36){
            return FightTier.Gold;
        }
        return;
    }

    async init():Promise<boolean> {
        let myFighter = await Fighter.load(this.name);
        if (myFighter) {
            this.loadExist(myFighter);
            return true;
        }
        return false;
    }

    loadExist(loadedFighter:Fighter) {
        this.name = loadedFighter.name;
        this.tokens = loadedFighter.tokens;
        this.tokensSpent = loadedFighter.tokensSpent;
        this.wins = loadedFighter.wins;
        this.losses = loadedFighter.losses;
        this.forfeits = loadedFighter.forfeits;
        this.quits = loadedFighter.quits;
        this.fightsCount = loadedFighter.fightsCount;
        this.areStatsPrivate = loadedFighter.areStatsPrivate;
        this.power = loadedFighter.power;
        this.sensuality = loadedFighter.sensuality;
        this.toughness = loadedFighter.toughness;
        this.endurance = loadedFighter.endurance;
        this.dexterity = loadedFighter.dexterity;
        this.willpower = loadedFighter.willpower;
        this.features = loadedFighter.features;
        this.createdAt = loadedFighter.createdAt;
        this.updatedAt = loadedFighter.updatedAt;
        this.features = loadedFighter.features;
    }

    static dbToObject():Fighter{
        return new Fighter(null);
    }

    static async save(fighter:Fighter):Promise<boolean>{
        return true;
    }

    static async delete(fighterName:string):Promise<boolean>{
        return true;
    }

    static async load(fighterName:string):Promise<Fighter>{
        return new Fighter(fighterName);
    }

}