import {Dice} from "./Dice";
import {Fight} from "./Fight";
import {IFighter} from "./interfaces/IFighter";
import {FightAction} from "./FightAction";
import {Constants} from "./Constants";
import {Data} from "./Model";
import {Utils} from "./Utils";
import {Promise} from "es6-promise";
import Team = Constants.Team;
import FightTier = Constants.FightTier;
import TokensWorth = Constants.TokensWorth;
import Stats = Constants.Stats;
import StatTier = Constants.StatTier;
import {IModifier} from "./Modifier";
import {Modifiers} from "./Modifier";
import TriggerMoment = Constants.TriggerMoment;
import Trigger = Constants.Trigger;

export class Fighter implements IFighter{
    id:number = -1;
    name:string = "";
    tokens: number = 0;
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

    modifiers:Modifiers = new Modifiers();




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
                    `willpower` \
                    FROM `flistplugins`.?? WHERE name = ?", [Constants.fightersTableName, name], function(err, rows: Array<any>){
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
            var sql = "UPDATE `flistplugins`.?? SET `tokens` = ?,`wins` = ?,`losses` = ?,`forfeits` = ?,`quits` = ?,`totalFights` = ?,`winRate` = ?,`power` = ?,`sensuality` = ?,`dexterity` = ?,\
                `toughness` = ?,`endurance` = ?,`willpower` = ?,`areStatsPrivate` = ? WHERE `id` = ?;";
            sql = Data.db.format(sql, [Constants.fightersTableName, this.tokens, this.wins, this.losses, this.forfeits, this.quits, this.totalFights, this.winRate(), this.power, this.sensuality, this.dexterity, this.toughness, this.endurance, this.willpower, this.areStatsPrivate, this.id]);
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
            result = this.dice.roll(times).reduce(function(a, b){return a+b;});
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
        return (10 + this.power + this.sensuality + this.dexterity + (this.toughness * 2) + this.endurance);
    }

    maxHearts():number {
        return this.toughness;
    }

    lustPerOrgasm():number{
        return (10 + this.power + this.sensuality + this.dexterity + this.toughness * +(this.endurance * 2));
    }

    maxOrgasms():number {
        return this.endurance;
    }

    minFocus():number {
        return -1-this.willpower;
    }

    maxFocus():number {
        return 1+this.willpower;
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
        return this.consecutiveTurnsWithoutFocus >= Constants.maxTurnsWithoutFocus;
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
        return this.bondageItemsOnSelf() >= Constants.maxBondageItemsOnSelf;
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

    static create(name:string){
        return new Promise(function(resolve, reject) {
            Data.db.query("INSERT INTO `flistplugins`.??(`name`) VALUES (?,?)", [Constants.fightersTableName, name], function (err, result) {
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
                Data.db.query("INSERT INTO `flistplugins`.??(`name`, `power`, `sensuality`, `dexterity`, `toughness`,`endurance`, `willpower`) VALUES (?,?,?,?,?,?)", [Constants.fightersTableName, name, power, sensuality, dexterity, toughness, endurance, willpower], function (err, result) {
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
            "[b][color=red]Power[/color][/b]:  " + this.power + "      " + "[b][color=red]Hearts[/color][/b]: " + this.maxHearts() + " * " + this.hpPerHeart() +" [b][color=red]HP[/color] per heart[/b]"+"\n" +
            "[b][color=orange]Sensuality[/color][/b]:  " + this.sensuality + "      " + "[b][color=pink]Orgasms[/color][/b]: " + this.maxOrgasms() + " * " + this.lustPerOrgasm() +" [b][color=pink]Lust[/color] per Orgasm[/b]"+"\n" +
            "[b][color=green]Toughness[/color][/b]:  " + this.toughness + "\n" +
            "[b][color=cyan]Endurance[/color][/b]:    " + this.endurance + "      " + "[b][color=green]Win[/color]/[color=red]Loss[/color] record[/b]: " + this.wins + " - " + this.losses + "\n" +
            "[b][color=purple]Dexterity[/color][/b]: " + this.dexterity +  "      " + "[b][color=orange]Bronze tokens available[/color][/b]: " + this.bronzeTokens() + "\n" +
            "[b][color=blue]Willpower[/color][/b]: " + this.willpower +  "      " + "[b][color=orange]Total tokens:[/color][/b]: " + this.tokens + "\n";/*+ "\n\n"  +
            "[b][color=red]Perks[/color][/b]:[b]" + getFeaturesListString(stats.features) + "[/b]"*/
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

    outputStatus(){
        return `${this.getStylizedName()} ${this.hp}/${this.hpPerHeart()} [color=red]HP[/color]  |`+
                `  ${this.heartsRemaining}/${this.maxHearts()} [color=red]Hearts[/color]  |`+
                `  ${this.lust}/${this.lustPerOrgasm()} [color=pink]Lust[/color]  |`+
                `  ${this.orgasmsRemaining}/${this.maxOrgasms()} [color=pink]Orgasms[/color]  |`+
                `  [color=red][sub]${this.minFocus()}[/sub][/color]|[b]${this.focus}[/b]|[color=orange][sub]${this.maxFocus()}[/sub][/color] Focus  |`+
                `  ${this.bondageItemsOnSelf()}/${Constants.maxBondageItemsOnSelf} [color=black]Bondage Items[/color]  |`+
                (this.target != undefined ? `  [color=red]Target:[/color] ${this.target.getStylizedName()}` : "")+
                "\n";
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
        return `${modifierBeginning}[b][color=${Team[this.assignedTeam]}]${this.name}[/color][/b]${modifierEnding}`;
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
    }

    addStat(stat:Stats):any{
        let theStat = this[stat];
        let statTier = Utils.getStatTier(theStat);
        let amountToRemove = 0;
        if(statTier == StatTier.Bronze){
            amountToRemove = TokensWorth.Bronze;
        }
        else if(statTier == StatTier.Silver){
            amountToRemove = TokensWorth.Silver;
        }
        else if(statTier == StatTier.Gold){
            amountToRemove = TokensWorth.Gold;
        }

        if(amountToRemove != 0 && (this.tokens - amountToRemove >= 0)){
            this.tokens -= amountToRemove;
            this[stat]++;
            this.update();
        }
        else{
            return false;
        }
    }

    removeStat(stat:Stats):any{
        let theStat = this[stat];
        let statTier = Utils.getStatTier(theStat);
        let amountToGive = 0;
        if(statTier == StatTier.Bronze){
            amountToGive = TokensWorth.Bronze;
        }
        else if(statTier == StatTier.Silver){
            amountToGive = TokensWorth.Silver;
        }
        else if(statTier == StatTier.Gold){
            amountToGive = TokensWorth.Gold;
        }

        if(amountToGive != 0){
            this.tokens += Math.floor(amountToGive/2);
            this[stat]--;
            this.update();
        }
        else{
            return false;
        }
    }

    giveTokens(amount){
        this.tokens += amount;
    }

    removeTokens(amount){
        this.tokens -= amount;
        if(this.tokens < 0){
            this.tokens = 0;
        }
    }

    tier():FightTier{
        if(this.power <= 2 && this.sensuality <= 2 && this.dexterity <= 2 && this.toughness <= 2 && this.endurance <= 2 && this.willpower <= 2){
            return FightTier.Bronze;
        }
        else if(this.power <= 4 && this.sensuality <= 4 && this.dexterity <= 4 && this.toughness <= 4 && this.endurance <= 4 && this.willpower <= 4){
            return FightTier.Silver;
        }
        else if(this.power <= 6 && this.sensuality <= 6 && this.dexterity <= 6 && this.toughness <= 6 && this.endurance <= 6 && this.willpower <= 6){
            return FightTier.Gold;
        }
        return;
    }

    static exists(name:string){
        return new Promise<Fighter>(function(resolve, reject) {
            Data.db.query("SELECT `id`, \
                    `name`, \
                    `tokens`, \
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
                    `willpower` \
                    FROM `flistplugins`.?? WHERE name = ?", [Constants.fightersTableName, name], function (err, rows) {
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