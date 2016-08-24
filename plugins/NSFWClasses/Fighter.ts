import {BaseModel} from "./Model";
import {Dice} from "./Dice";
export class Fighter extends BaseModel {
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

    power:number = 0;
    dexterity:number = 0;
    toughness:number = 0;
    endurance:number = 0;
    willpower:number = 0;




    //during fight
    hp:number = 0;
    heartsRemaining:number = 0;
    lust:number = 0;
    orgasmsRemaining:number = 0;
    focus:number = 0;
    lastAttack:string = "";
    usedAttacks:Array<string> = [];
    dice: Dice;

    constructor(name:string, power?:number, dexterity?:number, toughness?:number, endurance?:number, willpower?:number) {
        super();
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
                if(rows.length == 0){
                    //create
                    if(power != undefined && dexterity != undefined && toughness != undefined && endurance != undefined && willpower != undefined){
                        self.create(name, power, dexterity, toughness, endurance, willpower);
                    }
                    else{
                        // error
                        throw new Error("Not expected to get here.");
                    }
                }
                else{
                    self.initFromData(rows);
                }
            });
        }
        else {
            //error
            throw new Error("No name passed.");
        }
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

    create(name:string, power:number, dexterity:number, toughness:number, endurance:number, willpower:number){
        let self = this;
        BaseModel.db.query("INSERT INTO `flistplugins`.`nsfw_fighters`(`name`, `power`, `dexterity`, `toughness`,`endurance`, `willpower`) VALUES (?,?,?,?,?,?)", [name, power, dexterity, toughness, endurance, willpower], function(err, result){
            if(result){
                console.log(JSON.stringify(result));
                let data = [{name: name, power: power, dexterity: dexterity, toughness: toughness, endurance: endurance, willpower: willpower}];
                self.initFromData(data);
            }
        });
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
        this.lastAttack = "";
        this.usedAttacks = [];
        this.dice = new Dice(10);

        console.log(JSON.stringify(this));
    }

}