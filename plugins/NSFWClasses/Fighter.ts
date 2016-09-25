import {Dice} from "./Dice";
import {Fight} from "./Fight";
import {IFighter} from "./interfaces/IFighter";
import {FightAction} from "./FightAction";
import {Constants} from "./Constants";
import {Data} from "./Model";
import {Utils} from "./Utils";

import Team = Constants.Team;
import FightTier = Constants.FightTier;
import TokensWorth = Constants.TokensWorth;
import Affinity = Constants.Affinity;
import Stats = Constants.Stats;
import StatTier = Constants.StatTier;
import {IModifier} from "./Modifier";
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
    winRate: number = 0;
    areStatsPrivate:boolean = true;
    affinity:Affinity = Affinity.Power;

    power:number = 0;
    sensuality:number = 0;
    toughness:number = 0;
    endurance:number = 0;
    dexterity:number = 0;
    willpower:number = 0;

    modifiers:Array<IModifier> = [];




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
    lastTagTurn:number = 9999999;
    pendingAction:FightAction;

    constructor() {
    }

    load(name){
        return new Promise(function(fullfill, reject){
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
                    `winRate`, \
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

    updateInDb(){
        return new Promise(function(resolve, reject) {
            var sql = "UPDATE `flistplugins`.?? SET `tokens` = ?,`wins` = ?,`losses` = ?,`forfeits` = ?,`quits` = ?,`totalFights` = ?,`winRate` = ?,`power` = ?,`sensuality` = ?,`dexterity` = ?,\
                `toughness` = ?,`endurance` = ?,`willpower` = ?,`areStatsPrivate` = ?,`affinity` = ? WHERE `id` = ?;";
            sql = Data.db.format(sql, [Constants.fightersTableName, this.tokens, this.wins, this.losses, this.forfeits, this.quits, this.totalFights, this.winRate, this.power, this.sensuality, this.dexterity, this.toughness, this.endurance, this.willpower, this.areStatsPrivate, this.affinity, this.id]);
            Data.db.query(sql, function (err, result) {
                if (result) {
                    console.log("Updated "+this.name+"'s entry in the db.");
                    resolve();
                }
                else {
                    reject("Unable to update fighter "+this.name+ " " + err);
                }
            });
        });
    }

    //returns dice score
    roll(times:number = 1, eventBefore:Trigger = Trigger.BeforeRoll, eventAfter:Trigger = Trigger.AfterRoll):number{
        this.triggerMods(eventBefore);
        let result = 0;
        if(times == 1){
            result = this.dice.roll(1);
        }
        else{
            result = this.dice.roll(times).reduce(function(a, b){return a+b;});
        }
        this.triggerMods(eventAfter);
        return result;
    }

    triggerMods(event:Trigger){
        for(let mod of this.modifiers){
            mod.trigger(event);
        }
    }

    get hpPerHeart():number {
        return (10 + this.power + this.sensuality + this.dexterity + (this.toughness * 2) + this.endurance);
    }

    get maxHearts():number {
        return this.toughness;
    }

    get lustPerOrgasm():number{
        return (10 + this.power + this.sensuality + this.dexterity + this.toughness * +(this.endurance * 2));
    }

    get maxOrgasms():number {
        return this.endurance;
    }

    get minFocus():number {
        return -1-this.willpower;
    }

    get maxFocus():number {
        return 1+this.willpower;
    }

    hitHp(hp:number) {
        hp = Math.floor(hp);
        if (hp < 1) {
            hp = 1;
        }
        this.triggerMods(Trigger.BeforeHPDamage);
        this.hp -= hp;
        this.fight.addMessage(`${this.name} [color=red]lost ${hp} HP![/color]`);
        if(this.hp <= 0){
            this.triggerMods(Trigger.BeforeHeartLoss);
            this.hp = 0;
            this.heartsRemaining--;
            this.fight.addMessage(`[b][color=red]Heart broken![/color][/b] ${this.name} has ${this.heartsRemaining} hearts left.`);
            if(this.heartsRemaining > 0){
                this.hp = this.hpPerHeart;
            }
            else if(this.heartsRemaining == 1){
                this.fight.addMessage(`[b][color=red]Last heart[/color][/b] for ${this.name}!`);
            }
            this.triggerMods(Trigger.AfterHeartLoss);
        }
        this.triggerMods(Trigger.AfterHPDamage);
    }

    hitLust(lust:number) {
        lust = Math.floor(lust);
        if (lust < 1) {
            lust = 1;
        }
        this.triggerMods(Trigger.BeforeLustDamage);
        this.lust += lust;
        this.fight.addMessage(`${this.name} [color=red]gained ${lust} Lust![/color]`);
        if(this.lust >= this.lustPerOrgasm){
            this.triggerMods(Trigger.BeforeOrgasm);
            this.lust = 0;
            this.orgasmsRemaining--;
            this.fight.addMessage(`[b][color=pink]Orgasm on the mat![/color][/b] ${this.name} has ${this.orgasmsRemaining} orgasms left.`);
            this.lust = 0;
            this.triggerMods(Trigger.AfterOrgasm);
            if(this.orgasmsRemaining == 1){
                this.fight.addMessage(`[b][color=red]Last orgasm[/color][/b] for ${this.name}!`);
            }
        }
        this.triggerMods(Trigger.AfterLustDamage);
    }

    hitFocus(amount:number) {
        amount = Math.floor(amount);
        if(amount == 0){
            return;
        }
        this.triggerMods(Trigger.BeforeFocusDamage);
        this.focus -= amount;
        if(this.focus >= this.maxFocus) {
            this.focus = this.maxFocus;
        }
        this.triggerMods(Trigger.AfterFocusDamage);
        if(this.focus == this.minFocus) {
            this.fight.addMessage(`${this.getStylizedName()} seems way too distracted to possibly continue the fight! Is it their submissiveness? Their morale? One thing's sure, they'll be soon too broken to continue fighting!`);
        }
    }

    triggerInsideRing(){
        this.isInTheRing = true;
    }

    triggerOutsideRing(){
        this.isInTheRing = false;
    }

    isDead():boolean{
        return this.heartsRemaining == 0;
    }

    isSexuallyExhausted():boolean{
        return this.orgasmsRemaining == 0;
    }

    isBroken():boolean{
        return this.focus < this.minFocus;
    }

    isTechnicallyOut():boolean{
        return (this.isSexuallyExhausted() || this.isDead() || this.isBroken());
    }

    static create(name:string, affinity:Affinity){
        return new Promise(function(resolve, reject) {
            Data.db.query("INSERT INTO `flistplugins`.??(`name`, `affinity`) VALUES (?,?)", [Constants.fightersTableName, name, affinity], function (err, result) {
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
            let self = this;
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
        return "[b]" + this.name + "[/b]'s stats" + "              [i]Affinity:[/i] [b]" + Affinity[this.affinity] + "[/b]" + "\n" +
            "[b][color=red]Power[/color][/b]:  " + this.power + "      " + "[b][color=red]Hearts[/color][/b]: " + this.maxHearts + " * " + this.hpPerHeart +" [b][color=red]HP[/color] per heart[/b]"+"\n" +
            "[b][color=orange]Sensuality[/color][/b]:  " + this.sensuality + "      " + "[b][color=pink]Orgasms[/color][/b]: " + this.maxOrgasms + " * " + this.lustPerOrgasm +" [b][color=pink]Lust[/color] per Orgasm[/b]"+"\n" +
            "[b][color=green]Toughness[/color][/b]:  " + this.toughness + "\n" +
            "[b][color=cyan]Endurance[/color][/b]:    " + this.endurance + "      " + "[b][color=green]Win[/color]/[color=red]Loss[/color] record[/b]: " + this.wins + " - " + this.losses + "\n" +
            "[b][color=purple]Dexterity[/color][/b]: " + this.dexterity +  "      " + "[b][color=orange]Bronze tokens available[/color][/b]: " + this.bronzeTokens + "\n" +
            "[b][color=blue]Willpower[/color][/b]: " + this.willpower +  "      " + "[b][color=orange]Total tokens:[/color][/b]: " + this.tokens + "\n";/*+ "\n\n"  +
            "[b][color=red]Perks[/color][/b]:[b]" + getFeaturesListString(stats.features) + "[/b]"*/
    }

    get bronzeTokens():number{
        return Math.floor(this.tokens/TokensWorth.Bronze);
    }

    get silverTokens():number{
        return Math.floor(this.tokens/TokensWorth.Silver);
    }

    get goldTokens():number{
        return Math.floor(this.tokens/TokensWorth.Gold);
    }

    outputStatus(){
        return `${this.getStylizedName()} ${this.hp}/${this.hpPerHeart} [color=red]HP[/color]  |`+
                `  ${this.heartsRemaining}/${this.maxHearts} [color=red]Hearts[/color]  |`+
                `  ${this.lust}/${this.lustPerOrgasm} [color=pink]Lust[/color]  |`+
                `  ${this.orgasmsRemaining}/${this.maxOrgasms} [color=pink]Orgasms[/color]  |`+
                `  [color=red][sub]${this.minFocus}[/sub][/color]|[b]${this.focus}[/b]|[color=red][sub]${this.maxFocus}[/sub][/color] Focus`+
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

        this.hp = this.hpPerHeart;
        this.heartsRemaining = this.maxHearts;
        this.lust = 0;
        this.orgasmsRemaining = this.maxOrgasms;
        this.focus = this.willpower;
        this.dice = new Dice(10);
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
            return this.updateInDb();
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
            this.tokens += amountToGive;
            this[stat]--;
            return this.updateInDb();
        }
        else{
            return false;
        }
    }

    giveTokens(amount){
        this.tokens += amount;
        return this.updateInDb();
    }

    removeTokens(amount){
        this.tokens -= amount;
        if(this.tokens < 0){
            this.tokens = 0;
        }
        return this.updateInDb();
    }

    get tier():FightTier{
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
        return new Promise(function(resolve, reject) {
            Data.db.query("SELECT `id`, \
                    `name`, \
                    `tokens`, \
                    `wins`, \
                    `losses`, \
                    `forfeits`, \
                    `quits`, \
                    `areStatsPrivate`, \
                    `totalFights`, \
                    `winRate`, \
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
                        resolve(false);
                    }
                }
            });
        });
    }

}