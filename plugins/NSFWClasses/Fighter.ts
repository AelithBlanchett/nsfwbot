import {Dice} from "./Dice";
import {Fight} from "./Fight";
import {IFighter} from "./interfaces/IFighter";
import {FightAction} from "./FightAction";
import * as Constants from "./Constants";
import {Data} from "./Model";
import {Utils} from "./Utils";
import {Promise} from "es6-promise";
import Team = Constants.Team;
import FightTier = Constants.FightTier;
import TokensWorth = Constants.TokensWorth;
import Stats = Constants.Stats;
import {IModifier} from "./Modifier";
import {Modifiers} from "./Modifier";
import TriggerMoment = Constants.TriggerMoment;
import Trigger = Constants.Trigger;
import {ModifierType} from "./Constants";
import {Tier} from "./Constants";
import {Feature} from "./Feature";
import {Features} from "./Feature";
import {FeatureType} from "./Constants";
import {Achievements} from "./Achievement";
import {AchievementType} from "./Constants";
import {Achievement} from "./Constants";
import {AchievementReward} from "./Constants";

export class Fighter implements IFighter{
    id:number = -1;
    name:string = "";
    tokens: number = 0;
    tokensSpent: number = 0;
    wins: number = 0;
    losses: number = 0;
    forfeits: number = 0;
    quits: number = 0;
    totalFights: number = 0;
    areStatsPrivate:boolean = true;

    power:number = 0;
    sensuality:number = 0;
    toughness:number = 0;
    endurance:number = 0;
    dexterity:number = 0;
    willpower:number = 0;
    features:Features = new Features();
    modifiers:Modifiers = new Modifiers();
    achievements:Achievements = new Achievements();




    //during fight
    fight:Fight;
    dice: Dice;
    target:Fighter;

    assignedTeam:Team;
    isReady:boolean = false;
    hp:number = 0;
    heartsRemaining:number = 0;
    lust:number = 0;
    orgasmsRemaining:number = 0;
    focus:number = 0;
    lastDiceRoll:number;
    isInTheRing:boolean = true;
    canMoveFromOrOffRing = true;
    lastTagTurn:number = 9999999;
    pendingAction:FightAction;
    wantsDraw:boolean = false;
    consecutiveTurnsWithoutFocus:number = 0;

    constructor() {
        this.dice = new Dice(12);
    }

    load(name){
        return new Promise((fullfill, reject) => {
            let self = this;
            if (name != undefined) {
                //load mysql
                Data.db.query(
                    "SELECT `id`, \
                    `name`, \
                    `tokens`, \
                    `tokensSpent`, \
                    `wins`, \
                    `losses`, \
                    `forfeits`, \
                    `quits`, \
                    `totalFights`, \
                    `power`, \
                    `sensuality`, \
                    `dexterity`, \
                    `toughness`, \
                    `endurance`, \
                    `willpower`, \
                    `areStatsPrivate`, \
                    `features`, \
                    `achievements` \
                    FROM `flistplugins`.?? WHERE name = ?", [Constants.SQL.fightersTableName, name], function(err, rows: Array<any>){
                    if (rows != undefined && rows.length != 0) {
                        self.initFromData(rows);
                        fullfill(self);
                    }
                    else{
                        reject("Fighter not found");
                    }
                });
            }
            else {
                //error
                reject("No name passed.");
            }
        });
    }

    checkAchievements(){
        let strBase = "Achievements won: ";
        let added = [];
        let count = 0;

        if(this.totalFights >= 5){
            if(this.achievements.add(AchievementType.FiveFights) == ""){
                this.giveTokens(50);
                count++;
                added.push(Achievement.FiveFights + " Reward: "+ AchievementReward.FiveFights);
            }
        }
        if(this.totalFights >= 10){
            if(this.achievements.add(AchievementType.TenFights) == "") {
                this.giveTokens(100);
                count++;
                added.push(Achievement.TenFights + " Reward: "+ AchievementReward.TenFights);
            }
        }
        if(this.totalFights >= 20){
            if(this.achievements.add(AchievementType.TwentyFights) == "") {
                this.giveTokens(150);
                count++;
                added.push(Achievement.TwentyFights + " Reward: "+ AchievementReward.TwentyFights);
            }
        }
        if(this.totalFights >= 40){
            if(this.achievements.add(AchievementType.FortyFights) == ""){
                this.giveTokens(200);
                count++;
                added.push(Achievement.FortyFights + " Reward: "+ AchievementReward.FortyFights);
            }
        }

        if(this.wins == 1){
            if(this.achievements.add(AchievementType.Rookie) == ""){
                this.giveTokens(10);
                count++;
                added.push(Achievement.Rookie + " Reward: "+ AchievementReward.Rookie);
            }
        }
        if(this.wins >= 5){
            if(this.achievements.add(AchievementType.WinFiveFights) == ""){
                this.giveTokens(50);
                count++;
                added.push(Achievement.WinFiveFights + " Reward: "+ AchievementReward.WinFiveFights);
            }
        }
        if(this.wins >= 10){
            if(this.achievements.add(AchievementType.WinTenFights) == ""){
                this.giveTokens(100);
                count++;
                added.push(Achievement.WinTenFights + " Reward: "+ AchievementReward.WinTenFights);
            }
        }
        if(this.wins >= 20){
            if(this.achievements.add(AchievementType.WinTwentyFights) == ""){
                this.giveTokens(200);
                count++;
                added.push(Achievement.WinTwentyFights + " Reward: "+ AchievementReward.WinTwentyFights);
            }
        }
        if(this.wins >= 20){
            if(this.achievements.add(AchievementType.WinThirtyFights) == ""){
                this.giveTokens(300);
                count++;
                added.push(Achievement.WinThirtyFights + " Reward: "+ AchievementReward.WinThirtyFights);
            }
        }
        if(this.wins >= 40){
            if(this.achievements.add(AchievementType.WinFortyFights) == ""){
                this.giveTokens(400);
                count++;
                added.push(Achievement.WinFortyFights + " Reward: "+ AchievementReward.WinFortyFights);
            }
        }

        if(this.tier() == FightTier.Silver){
            if(this.achievements.add(AchievementType.ReachedSilver) == ""){
                this.giveTokens(100);
                count++;
                added.push(Achievement.ReachedSilver + " Reward: "+ AchievementReward.ReachedSilver);
            }
        }
        if(this.tier() == FightTier.Gold){
            if(this.achievements.add(AchievementType.ReachedGold) == ""){
                this.giveTokens(200);
                count++;
                added.push(Achievement.ReachedGold + " Reward: "+ AchievementReward.ReachedGold);
            }
        }

        if(count > 0){
            strBase += added.join(", ");
        }
        else{
            strBase = "";
        }

        return strBase;
    }

    update():Promise<boolean>{
        return new Promise<boolean>((res, rej) =>{
            this.updateInDb().then(() => {
                this.load(this.name).then( () =>{
                    res(true);
                }).catch(err => {
                    rej(false);
                });
            }).catch(err => {
                rej(false);
            });
        });
    }

    updateInDb(){
        return new Promise<number>((resolve, reject) => {
            var sql = "UPDATE `flistplugins`.?? SET `tokens` = ?,`tokensSpent` = ?,`wins` = ?,`losses` = ?,`forfeits` = ?,`quits` = ?,`totalFights` = ?,`winRate` = ?,`power` = ?,`sensuality` = ?,`dexterity` = ?,\
                `toughness` = ?,`endurance` = ?,`willpower` = ?,`areStatsPrivate` = ?, `features` = ?, `achievements` = ? WHERE `id` = ?;";
            sql = Data.db.format(sql, [Constants.SQL.fightersTableName, this.tokens, this.tokensSpent, this.wins, this.losses, this.forfeits, this.quits, this.totalFights, this.winRate(), this.power, this.sensuality, this.dexterity, this.toughness, this.endurance, this.willpower, this.areStatsPrivate, JSON.stringify(this.features), JSON.stringify(this.achievements), this.id]);
            Data.db.query(sql, (err, result) => {
                if (result) {
                    console.log("Updated "+this.name+"'s entry in the db.");
                    resolve(result.affectedRows);
                }
                else {
                    reject("Unable to update fighter "+this.name+ " " + err);
                }
            });
        });
    }

    winRate():number{
        let winRate = 0.00;
        if(this.totalFights > 0 && this.wins > 0){
            winRate = this.totalFights/this.wins;
        }
        else if(this.totalFights > 0 && this.losses > 0){
            winRate = 1 - this.totalFights/this.losses;
        }
        return winRate;
    }

    //returns dice score
    roll(times:number = 1, event:Trigger = Trigger.Roll):number{
        this.triggerMods(TriggerMoment.Before, event);
        let result = 0;
        if(times == 1){
            result = this.dice.roll(1);
        }
        else{
            result = this.dice.roll(times);
        }
        this.triggerMods(TriggerMoment.After, event);
        return result;
    }

    triggerMods(moment:TriggerMoment, event:Trigger, objFightAction?:any){
        for(let mod of this.modifiers){
            mod.trigger(moment, event, objFightAction);
        }
    }

    removeMod(idMod:string){ //removes a mod, and also its children. If a children has two parent Ids, then it doesn't remove the mod.
        let index = this.modifiers.findIndex(x => x.id == idMod);
        let listOfModsToRemove = [];
        if(index != -1){
            listOfModsToRemove.push(index);
            for(let mod of this.modifiers){
                if(mod.parentIds){
                    if(mod.parentIds.length == 1 && mod.parentIds[0] == idMod){
                        listOfModsToRemove.push(mod);
                    }
                    else if(mod.parentIds.indexOf(idMod) != -1){
                        mod.parentIds.splice(mod.parentIds.indexOf(idMod));
                    }
                }

            }
        }
        for(let modIndex of listOfModsToRemove){
            this.modifiers.splice(modIndex);
        }
    }

    hpPerHeart():number {
        return 35;
    }

    maxHearts():number {
        let heartsSup = Math.ceil(this.toughness / 2);
        return 4 + heartsSup;
    }

    lustPerOrgasm():number{
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

    healHP(hp:number, triggerMods:boolean = true){
        hp = Math.floor(hp);
        if (hp < 1) {
            hp = 1;
        }
        if(triggerMods){this.triggerMods(TriggerMoment.Before, Trigger.HPHealing);}
        if(this.hp + hp > this.hpPerHeart()){
            hp = this.hpPerHeart() - this.hp; //reduce the number if it overflows the bar
        }
        this.hp += hp;
        if(triggerMods){this.triggerMods(TriggerMoment.After, Trigger.HPHealing);}
    }

    healLP(lust:number, triggerMods:boolean = true){
        lust = Math.floor(lust);
        if (lust < 1) {
            lust = 1;
        }
        if(triggerMods){this.triggerMods(TriggerMoment.Before, Trigger.LustHealing);}
        if(this.lust - lust < 0){
            lust = this.lust; //reduce the number if it overflows the bar
        }
        this.lust -= lust;
        if(triggerMods){this.triggerMods(TriggerMoment.After, Trigger.LustHealing);}
    }

    healFP(focus:number, triggerMods:boolean = true){
        focus = Math.floor(focus);
        if (focus < 1) {
            focus = 1;
        }
        if(triggerMods){this.triggerMods(TriggerMoment.Before, Trigger.FocusHealing);}
        if(this.focus + focus > this.maxFocus()){
            focus = this.maxFocus() - this.focus; //reduce the number if it overflows the bar
        }
        this.focus += focus;
        if(triggerMods){this.triggerMods(TriggerMoment.After, Trigger.FocusHealing);}
    }

    hitHP(hp:number, triggerMods:boolean = true) {
        hp = Math.floor(hp);
        if (hp < 1) {
            hp = 1;
        }
        if(triggerMods){this.triggerMods(TriggerMoment.Before, Trigger.HPDamage);}
        this.hp -= hp;
        if(this.hp <= 0){
            this.triggerMods(TriggerMoment.Before, Trigger.HeartLoss);
            this.hp = 0;
            this.heartsRemaining--;
            this.fight.message.addHit(`[b][color=red]Heart broken![/color][/b] ${this.name} has ${this.heartsRemaining} hearts left.`);
            if(this.heartsRemaining > 0){
                this.hp = this.hpPerHeart();
            }
            else if(this.heartsRemaining == 1){
                this.fight.message.addHit(`[b][color=red]Last heart[/color][/b] for ${this.name}!`);
            }
            this.triggerMods(TriggerMoment.After, Trigger.HeartLoss);
        }
        if(triggerMods){this.triggerMods(TriggerMoment.After, Trigger.HPDamage);}
    }

    hitLP(lust:number, triggerMods:boolean = true) {
        lust = Math.floor(lust);
        if (lust < 1) {
            lust = 1;
        }
        if(triggerMods){this.triggerMods(TriggerMoment.Before, Trigger.LustDamage);}
        this.lust += lust;
        if(this.lust >= this.lustPerOrgasm()){
            this.triggerMods(TriggerMoment.Before, Trigger.Orgasm);
            this.lust = 0;
            this.orgasmsRemaining--;
            this.fight.message.addHit(`[b][color=pink]Orgasm on the mat![/color][/b] ${this.name} has ${this.orgasmsRemaining} orgasms left.`);
            this.lust = 0;
            if(triggerMods){this.triggerMods(TriggerMoment.After, Trigger.Orgasm);}
            if(this.orgasmsRemaining == 1){
                this.fight.message.addHit(`[b][color=red]Last orgasm[/color][/b] for ${this.name}!`);
            }
        }
        this.triggerMods(TriggerMoment.After, Trigger.LustDamage);
    }

    hitFP(focusDamage:number, triggerMods:boolean = true) { //focusDamage CAN BE NEGATIVE to gain it
        if(focusDamage <= 0){
            return;
        }
        focusDamage = Math.floor(focusDamage);
        if(triggerMods){this.triggerMods(TriggerMoment.Before, Trigger.FocusDamage);}
        this.focus -= focusDamage;
        if(triggerMods){this.triggerMods(TriggerMoment.After, Trigger.FocusDamage);}
        if(this.focus <= this.minFocus()) {
            this.fight.message.addHit(`${this.getStylizedName()} seems way too distracted to possibly continue the fight! Is it their submissiveness? Their morale? One thing's sure, they'll be soon too broken to continue fighting!`);
        }
    }

    triggerInsideRing(){
        this.isInTheRing = true;
    }

    triggerOutsideRing(){
        this.isInTheRing = false;
    }

    triggerPermanentInsideRing(){
        this.isInTheRing = false;
        this.canMoveFromOrOffRing = false;
    }

    triggerPermanentOutsideRing(){
        this.triggerOutsideRing();
        this.canMoveFromOrOffRing = false;
    }

    isDead():boolean{
        return this.heartsRemaining == 0;
    }

    isSexuallyExhausted():boolean{
        return this.orgasmsRemaining == 0;
    }

    isBroken():boolean{
        return this.consecutiveTurnsWithoutFocus >= Constants.Fight.Action.Globals.maxTurnsWithoutFocus;
    }

    isTechnicallyOut():boolean{
        return (this.isSexuallyExhausted()
        || this.isDead()
        || this.isBroken()
        || this.isCompletelyBound());
    }

    bondageItemsOnSelf():number{
        let bondageModCount = 0;
        for(let mod of this.modifiers){
            if(mod.name == Constants.Modifier.Bondage){
                bondageModCount++;
            }
        }
        return bondageModCount;
    }

    isCompletelyBound():boolean{
        return this.bondageItemsOnSelf() >= Constants.Fight.Action.Globals.maxBondageItemsOnSelf;
    }

    isStunned():boolean{
        let isStunned = false;
        for(let mod of this.modifiers){
            if(mod.receiver == this && mod.type == ModifierType.Stun){
                isStunned = true;
            }
        }
        return isStunned;
    }

    isInHold():boolean{
        let isInHold = false;
        for(let mod of this.modifiers){
            if(mod.receiver == this && (mod.name == Constants.Modifier.SubHold || mod.name == Constants.Modifier.SexHold || mod.name == Constants.Modifier.HumHold )){
                isInHold = true;
            }
        }
        return isInHold;
    }

    isInSpecificHold(holdName:string):boolean{
        let isInHold = false;
        for(let mod of this.modifiers){
            if(mod.receiver == this && mod.name == holdName){
                isInHold = true;
            }
        }
        return isInHold;
    }

    isInHoldOfTier():Tier{
        let tier = Tier.None;
        for(let mod of this.modifiers){
            if(mod.receiver == this && (mod.name == Constants.Modifier.SubHold || mod.name == Constants.Modifier.SexHold || mod.name == Constants.Modifier.HumHold )){
                tier = mod.tier;
            }
        }
        return tier;
    }

    escapeHolds(){
        for(let mod of this.modifiers){
            if(mod.receiver == this && (mod.name == Constants.Modifier.SubHold || mod.name == Constants.Modifier.SexHold || mod.name == Constants.Modifier.HumHold )){
                this.removeMod(mod.id);
            }
        }
    }

    static create(name:string){
        return new Promise(function(resolve, reject) {
            Data.db.query("INSERT INTO `flistplugins`.?? (`name`) VALUES ( ? )", [Constants.SQL.fightersTableName, name], function (err, result) {
                if (result) {
                    console.log("Added "+name+" to the roster: "+JSON.stringify(result));
                    resolve();
                }
                else {
                    reject("Unable to create fighter. " + err);
                }
            });
        });
    }

    static createRaw(name:string, power:number, sensuality: number, dexterity:number, toughness:number, endurance:number, willpower:number){
        return new Promise(function(resolve, reject) {
            if (!(power != undefined && sensuality != undefined && dexterity != undefined && toughness != undefined && endurance != undefined && willpower != undefined)) {
                reject("Wrong stats passed.");
            }
            else {
                Data.db.query("INSERT INTO `flistplugins`.??(`name`, `power`, `sensuality`, `dexterity`, `toughness`,`endurance`, `willpower`) VALUES (?,?,?,?,?,?)", [Constants.SQL.fightersTableName, name, power, sensuality, dexterity, toughness, endurance, willpower], function (err, result) {
                    if (result) {
                        console.log(JSON.stringify(result));
                        resolve();
                    }
                    else {
                        reject("Unable to create fighter. " + err);
                    }
                });
            }
        });
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
        for(let achievementId of this.achievements){
            strResult.push(`${Achievement[AchievementType[achievementId]]}`);
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

    removeFeature(feature:FeatureType):string{
        let result = this.features.remove(feature);
        if(result == ""){
            this.update();
        }
        return result;
    }

    addFeature(feature:Feature):string{
        let amountToRemove = 0;
        switch (feature.type){
            case FeatureType.KickStart:
            case FeatureType.SexyKickStart:
                amountToRemove = 2 * feature.uses;
                break;
            case FeatureType.Sadist:
            case FeatureType.RyonaEnthusiast:
            case FeatureType.CumSlut:
                //Free features
                break;
        }

        if(this.tokens - amountToRemove >= 0){
            let result = this.features.add(feature);
            if(result == ""){
                this.removeTokens(amountToRemove);
                this.update();
            }
            return result;
        }
        else{
            return `Not enough tokens. Required: ${amountToRemove}.`;
        }
    }

    clearFeatures():string{
        let result = this.features.clear();
        if(result == ""){
            this.update();
        }
        return result;
    }

    hasFeature(featureType:FeatureType):boolean{
        return this.features.findIndex(x => x.type == featureType) != -1;
    }

    outputStatus(){
        return  Utils.pad(64, `${this.getStylizedName()}:`," ") +
                `  ${this.hp}/${this.hpPerHeart()} [color=red]HP[/color]  |`+
                `  ${this.heartsRemaining}/${this.maxHearts()} [color=red]Hearts[/color]  ------`+
                `  ${this.lust}/${this.lustPerOrgasm()} [color=pink]Lust[/color]  |`+
                `  ${this.orgasmsRemaining}/${this.maxOrgasms()} [color=pink]Orgasms[/color]  ------`+
                `  [color=red]${this.minFocus()}[/color]|[b]${this.focus}[/b]|[color=orange]${this.maxFocus()}[/color] ${this.hasFeature(FeatureType.DomSubLover) ? "Submissiveness" : "Focus"}  |`+
                `  ${this.consecutiveTurnsWithoutFocus}/[color=orange]${Constants.Fight.Action.Globals.maxTurnsWithoutFocus}[/color] Turns ${this.hasFeature(FeatureType.DomSubLover) ? "being too submissive" : "without focus"}  ------`+
                `  ${this.bondageItemsOnSelf()}/${Constants.Fight.Action.Globals.maxBondageItemsOnSelf} [color=purple]Bondage Items[/color]  ------`+
                `  [color=red]Target:[/color] `+(this.target != undefined ? `${this.target.getStylizedName()}` : "None");
    }

    getStylizedName(){
        let modifierBeginning = "";
        let modifierEnding = "";
        if(this.isTechnicallyOut()){
            modifierBeginning = `[s]`;
            modifierEnding = `[/s]`;
        }
        else if(!this.isInTheRing){
            modifierBeginning = `[i]`;
            modifierEnding = `[/i]`;
        }
        return `${modifierBeginning}[b][color=${Team[this.assignedTeam].toLowerCase()}]${this.name}[/color][/b]${modifierEnding}`;
    }

    initFromData(data:Array<any>){
        let row = data[0];
        for (let attribute in row)
        {
            if(this[attribute] != undefined){
                this[attribute] = row[attribute];
            }
        }

        this.hp = this.hpPerHeart();
        this.heartsRemaining = this.maxHearts();
        this.lust = 0;
        this.orgasmsRemaining = this.maxOrgasms();
        this.focus = this.willpower;
        let tempFeatures = JSON.parse(row["features"]);
        this.features = new Features();
        for(let feat of tempFeatures){
            let theFeature = new Feature(feat.modType, feat.uses, feat.id);
            this.features.add(theFeature);
        }

        let tempAchievements = JSON.parse(row["achievements"]);
        this.achievements = new Achievements();
        for(let achievement of tempAchievements){
            this.achievements.add(achievement);
        }
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
            this.update();
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
            this.update();
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

    static exists(name:string){
        return new Promise<Fighter>(function(resolve, reject) {
            Data.db.query("SELECT `id`, \
                    `name`, \
                    `tokens`, \
                    `tokensSpent`, \
                    `wins`, \
                    `losses`, \
                    `forfeits`, \
                    `quits`, \
                    `areStatsPrivate`, \
                    `totalFights`, \
                    `power`, \
                    `sensuality`, \
                    `dexterity`, \
                    `toughness`, \
                    `endurance`, \
                    `willpower`, \
                    `features`, \
                    `achievements` \
                    FROM `flistplugins`.?? WHERE name = ?", [Constants.SQL.fightersTableName, name], function (err, rows) {
                if (rows != undefined && rows.length == 1) {
                    let myTempWrestler = new Fighter();
                    myTempWrestler.initFromData(rows);
                    resolve(myTempWrestler);
                }
                else{
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(null);
                    }
                }
            });
        });
    }

}