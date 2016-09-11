import {Dice} from "./Dice";
import {Fight} from "./Fight";
import {IFighter} from "./interfaces/IFighter";
import {FightAction} from "./FightAction";
import {Constants} from "./Constants";
import Team = Constants.Team;
import {Data} from "./Model";
import FightTier = Constants.FightTier;
import TokensWorth = Constants.TokensWorth;

export class Fighter implements IFighter{
    id:number = -1;
    name:string = "";
    tokens: number = 0;
    wins: number = 0;
    losses: number = 0;
    forfeits: number = 0;
    quits: number = 0;
    areStatsPrivate:boolean = true;

    power:number = 0;
    dexterity:number = 0;
    toughness:number = 0;
    endurance:number = 0;
    willpower:number = 0;




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

    get hpPerHeart():number {
        return (10 + this.power + this.dexterity + (this.toughness * 2) + this.endurance);
    }

    get maxHearts():number {
        return this.toughness;
    }

    get lustPerOrgasm():number{
        return (10 + this.power + this.dexterity + this.toughness * +(this.endurance * 2));
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

    hitHp(hp) {
        hp = Math.floor(hp);
        if (hp < 1) {
            hp = 1;
        }
        this.hp -= hp;
        this.fight.addMessage(`${this.name} [color=red]lost ${hp} HP![/color]`);
        if(this.hp <= 0){
            this.hp = 0;
            this.heartsRemaining--;
            this.fight.addMessage(`[b][color=red]Heart broken![/color][/b] ${this.name} has ${this.heartsRemaining} hearts left.`);
            if(this.heartsRemaining > 0){
                this.hp = this.hpPerHeart;
            }
            else if(this.heartsRemaining == 1){
                this.fight.addMessage(`[b][color=red]Last heart[/color][/b] for ${this.name}!`);
            }
        }
    }

    hitLust(lust) {
        lust = Math.floor(lust);
        if (lust < 1) {
            lust = 1;
        }
        this.lust += lust;
        if(this.lust >= this.lustPerOrgasm){
            this.lust = 0;
            this.orgasmsRemaining--;
            this.fight.addMessage(`[b][color=blue]Orgasm on the mat![/color][/b] ${this.name} has ${this.orgasmsRemaining} orgasms left.`);
            this.lust = 0;
            if(this.orgasmsRemaining == 1){
                this.fight.addMessage(`[b][color=blue]Last orgasm[/color][/b] for ${this.name}!`);
            }
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

    isOut():boolean{
        return (!this.isInTheRing || this.isSexuallyExhausted() || this.isDead());
    }

    static create(name:string, power:number, dexterity:number, toughness:number, endurance:number, willpower:number){
        return new Promise(function(resolve, reject) {
            let self = this;
            if (!(power != undefined && dexterity != undefined && toughness != undefined && endurance != undefined && willpower != undefined)) {
                reject("Wrong stats passed.");
            }
            else {
                Data.db.query("INSERT INTO `flistplugins`.??(`name`, `power`, `dexterity`, `toughness`,`endurance`, `willpower`) VALUES (?,?,?,?,?,?)", [Constants.fightersTableName, name, power, dexterity, toughness, endurance, willpower], function (err, result) {
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
            "[b][color=red]Power[/color][/b]:  " + this.power + "      " + "[b][color=red]Hearts[/color][/b]: " + this.maxHearts + " * " + this.hpPerHeart +" [b][color=red]HP[/color] per heart[/b]"+"\n" +
            "[b][color=orange]Dexterity[/color][/b]:  " + this.dexterity + "      " + "[b][color=pink]Orgasms[/color][/b]: " + this.maxOrgasms + " * " + this.lustPerOrgasm +" [b][color=pink]Lust[/color] per Orgasm[/b]"+"\n" +
            "[b][color=green]Toughness[/color][/b]:  " + this.toughness + "\n" +
            "[b][color=cyan]Endurance[/color][/b]:    " + this.endurance + "      " + "[b][color=green]Win[/color]/[color=red]Loss[/color] record[/b]: " + this.wins + " - " + this.losses + "\n" +
            "[b][color=purple]Willpower[/color][/b]: " + this.willpower +  "      " + "[b][color=orange]Bronze tokens available[/color][/b]: " + this.bronzeTokens + "\n" +
            "[b][color=blue]Endurance[/color][/b]: " + this.endurance +  "      " + "[b][color=orange]Total tokens:[/color][/b]: " + this.tokens + "\n";/*+ "\n\n"  +
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
                `  [sub]${this.minFocus}[/sub]|[b]${this.focus}[/b]|[sub]${this.maxFocus}[/sub] Focus[/color]`+
                (this.target != undefined ? `  [color=red]Target:[/color] ${this.target.getStylizedName()}` : "")+
                "\n";
    }

    getStylizedName(){
        let modifierBeginning = "";
        let modifierEnding = "";
        if(this.isDead() || this.isSexuallyExhausted()){
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

    giveTokens(amount){
        return new Promise((resolve, reject) => {
            //Do the db
            var sql = "UPDATE `flistplugins`.?? SET `tokens` = `tokens`+? WHERE `id` = ?;";
            sql = Data.db.format(sql, [Constants.fightersTableName, amount,this.id]);
            Data.db.query(sql, function(err, results) {
                if(err){
                    reject(err);
                }
                else{
                    resolve();
                }
            });
        });
    }

    removeTokens(amount){
        return new Promise((resolve, reject) => {
            //Do the db
            var sql = "UPDATE `flistplugins`.?? SET `tokens` = `tokens`-? WHERE `id` = ?;";
            sql = Data.db.format(sql, [Constants.fightersTableName, amount,this.id]);
            Data.db.query(sql, function(err, results) {
                if(err){
                    reject(err);
                }
                else{
                    resolve();
                }
            });
        });
    }

    get tier():FightTier{
        if(this.power <= 2 && this.dexterity <= 2 && this.toughness <= 2 && this.endurance <= 2 && this.willpower <= 2){
            return FightTier.Bronze;
        }
        else if(this.power <= 4 && this.dexterity <= 4 && this.toughness <= 4 && this.endurance <= 4 && this.willpower <= 4){
            return FightTier.Silver;
        }
        else if(this.power <= 6 && this.dexterity <= 6 && this.toughness <= 6 && this.endurance <= 6 && this.willpower <= 6){
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