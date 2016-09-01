import {BaseModel} from "./Model";
import {Dice} from "./Dice";
import {Fight} from "./Fight";
import {IFighter} from "./interfaces/IFighter";
import {FightAction} from "./FightAction";
import {Constants} from "./Constants";
import Team = Constants.Team;

export class Fighter extends BaseModel implements IFighter{
    id:number = -1;
    name:string = "";
    bronzeTokens:number = 0;
    silverTokens: number = 0;
    goldTokens: number = 0;
    totalTokens: number = 0;
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
    assignedTeam:Team;
    teamName:string;
    isReady:boolean = false;
    hp:number = 0;
    heartsRemaining:number = 0;
    lust:number = 0;
    orgasmsRemaining:number = 0;
    focus:number = 0;
    pastActions:Array<FightAction> = [];
    dice: Dice;
    target:Fighter;

    constructor() {
        super();
    }

    load(name){
        return new Promise(function(fullfill, reject){
            let self = this;
            if (name != undefined) {
                //load mysql
                BaseModel.db.query(
                    "SELECT `nsfw_fighters`.`id`, \
                    `nsfw_fighters`.`name`, \
                    `nsfw_fighters`.`bronzeTokens`, \
                    `nsfw_fighters`.`silverTokens`, \
                    `nsfw_fighters`.`goldTokens`, \
                    `nsfw_fighters`.`totalTokens`, \
                    `nsfw_fighters`.`wins`, \
                    `nsfw_fighters`.`losses`, \
                    `nsfw_fighters`.`forfeits`, \
                    `nsfw_fighters`.`quits`, \
                    `nsfw_fighters`.`totalFights`, \
                    `nsfw_fighters`.`winRate`, \
                    `nsfw_fighters`.`power`, \
                    `nsfw_fighters`.`dexterity`, \
                    `nsfw_fighters`.`toughness`, \
                    `nsfw_fighters`.`endurance`, \
                    `nsfw_fighters`.`willpower` \
                    FROM `flistplugins`.`nsfw_fighters` WHERE name = ?", name, function(err, rows: Array<any>){
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
        if(this.hp <= 0){
            this.hp = 0;
            this.heartsRemaining--;
        }

        if(this.heartsRemaining > 0){
            this.hp = this.hpPerHeart;
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
        }

        if(this.lust > 0){
            this.lust = 0;
        }
    }

    static create(name:string, power:number, dexterity:number, toughness:number, endurance:number, willpower:number){
        return new Promise(function(resolve, reject) {
            let self = this;
            if (!(power != undefined && dexterity != undefined && toughness != undefined && endurance != undefined && willpower != undefined)) {
                reject("Wrong stats passed.");
            }
            else {
                BaseModel.db.query("INSERT INTO `flistplugins`.`nsfw_fighters`(`name`, `power`, `dexterity`, `toughness`,`endurance`, `willpower`) VALUES (?,?,?,?,?,?)", [name, power, dexterity, toughness, endurance, willpower], function (err, result) {
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
            "[b][color=purple]Willpower[/color][/b]: " + this.willpower +  "      " + "[b][color=orange]Bronze tokens[/color][/b]: " + this.bronzeTokens + "\n" +
            "[b][color=blue]Endurance[/color][/b]: " + this.endurance +  "      " + "[b][color=orange]Total tokens:[/color][/b]: " + this.totalTokens + " / "+"99"+ "\n" /*+ "\n\n"  +
            "[b][color=red]Perks[/color][/b]:[b]" + getFeaturesListString(stats.features) + "[/b]"*/
    }

    outputStatus(){
        return `${this.getStylizedName()} ${this.hp}/${this.hpPerHeart} [color=red]HP[/color]  |  ${this.heartsRemaining}/${this.maxHearts} [color=red]Hearts[/color]  |  ${this.lust}/${this.lustPerOrgasm} [color=pink]Lust[/color]  |  ${this.orgasmsRemaining}/${this.maxOrgasms} [color=pink]Orgasms[/color]  |  [sub]${this.minFocus}[/sub]|[b]${this.focus}[/b]|[sub]${this.maxFocus}[/sub] Focus[/color]\n`;
    }

    getStylizedName(){
        return `[b][color=${Team[this.assignedTeam]}]${this.name}[/color][/b]`;
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
        this.pastActions = [];
        this.dice = new Dice(10);
    }

    static exists(name:string){
        return new Promise(function(resolve, reject) {
            BaseModel.db.query("SELECT `nsfw_fighters`.`id`, \
                    `nsfw_fighters`.`name`, \
                    `nsfw_fighters`.`bronzeTokens`, \
                    `nsfw_fighters`.`silverTokens`, \
                    `nsfw_fighters`.`goldTokens`, \
                    `nsfw_fighters`.`totalTokens`, \
                    `nsfw_fighters`.`wins`, \
                    `nsfw_fighters`.`losses`, \
                    `nsfw_fighters`.`forfeits`, \
                    `nsfw_fighters`.`quits`, \
                    `nsfw_fighters`.`areStatsPrivate`, \
                    `nsfw_fighters`.`totalFights`, \
                    `nsfw_fighters`.`winRate`, \
                    `nsfw_fighters`.`power`, \
                    `nsfw_fighters`.`dexterity`, \
                    `nsfw_fighters`.`toughness`, \
                    `nsfw_fighters`.`endurance`, \
                    `nsfw_fighters`.`willpower` \
                    FROM `flistplugins`.`nsfw_fighters` WHERE name = ?", name, function (err, rows) {
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