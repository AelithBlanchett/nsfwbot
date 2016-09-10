import {Fighter} from "./Fighter";
import {BaseModel} from "./Model";
import {Dice} from "./Dice";
import {FightAction} from "./FightAction";
import {IFChatLib} from "./interfaces/IFChatLib";
import {Utils} from "./Utils";
import {Dictionary} from "./Dictionary";
import {Constants} from "./Constants";
import Team = Constants.Team;
import {FighterList} from "./FighterList";
import BaseDamage = Constants.BaseDamage;
import Tiers = Constants.Tiers;
import RequiredRoll = Constants.RequiredRoll;

export class Fight extends BaseModel{
    id:number = -1;
    hasStarted:boolean  = false;
    stage:string;

    //real fighting variables
    fighterList:FighterList;
    currentTurn:number = 0;
    usedTeams:number = 2;

    fightActions:Array<FightAction>;
    attacker:Fighter;
    defender:Fighter;
    holdAttacker:Fighter;
    holdDefender:Fighter;

    message:string = "";
    fChatLibInstance:IFChatLib;
    channel:string;

    public constructor(fChatLibInstance:IFChatLib, channel:string, stage?:string) {
        super();
        this.stage = stage || "Wrestling Ring";
        this.fChatLibInstance = fChatLibInstance;
        this.channel = channel;
        this.fighterList = new FighterList();
    }

    //Pre-fight utils

    join(fighter:Fighter, team:Team){
        if(!this.hasStarted){
            if(!this.fighterList.getFighterByName(fighter.name)){ //find fighter by its name property instead of comparing objects, which doesn't work.
                if(team != Team.Unknown){
                    fighter.assignedTeam = team;
                }
                else{
                    fighter.assignedTeam = this.fighterList.getAvailableTeam();
                    console.log(`assigned team ${fighter.assignedTeam} to ${fighter.name}`);
                }
                fighter.fight = this;
                this.fighterList.push(fighter);
                return true;
            }
        }
        return false;
    }

    setFighterReady(fighter:Fighter){
        if(!this.hasStarted){
            if(!this.fighterList.getFighterByName(fighter.name)){
                this.join(fighter, Team.Unknown);
            }
            var fighterInFight = this.fighterList.getFighterByName(fighter.name);
            if(fighterInFight && !fighterInFight.isReady){ //find fighter by its name property instead of comparing objects, which doesn't work.
                fighterInFight.isReady = true;
                this.addMessage("[color=red]"+fighter.name+" is now ready to get it on![/color]");
                this.sendMessage();
                if(this.canStartMatch()){
                    this.startMatch();
                }
                return true;
            }
        }
        return false;
    }

    canStartMatch(){
        let canGo = (this.fighterList.isEveryoneReady() && !this.hasStarted && this.fighterList.getUsedTeams().length >= this.usedTeams);
        return canGo; //only start if everyone's ready and if the teams are balanced
    }


    //Fight logic

    startMatch(){
        this.addMessage("\n[color=green]Everyone's ready, let's start the match![/color]");
        this.hasStarted = true;

        this.fighterList.shufflePlayers(); //random order for teams

        for(let i = 0; i < this.fighterList.maxPlayersPerTeam; i++){ //Prints as much names as there are team
            let fullStringVS = "[b]";
            for(let j of this.fighterList.getUsedTeams()){
                let theFighter=this.fighterList.getTeam(j)[i];
                if(theFighter != undefined){
                    fullStringVS = `${fullStringVS} VS ${theFighter.getStylizedName()}`;
                }
            }
            fullStringVS = `${fullStringVS}[/b]`;
            fullStringVS =  fullStringVS.replace(" VS ","");
            this.addMessage(fullStringVS);
        }


        this.sendMessage();
        this.fighterList.reorderFightersByInitiative(this.rollAllDice());
        this.addMessage(`${this.currentTeamName} team starts first!`);
        this.sendMessage();
        this.currentTurn++;
        this.outputStatus();
    }

    nextTurn(){
        this.currentTurn++;
        this.outputStatus();
        setTimeout(_ => {this.actionBrawl(Tiers.Light);}, 1000);
    }

    //Fighting info displays

    outputStatus(){
        this.addMessage(`\n[b]Turn #${this.currentTurn}[/b] [color=${this.currentTeamName}]------ ${this.currentTeamName} team ------[/color] It's [u]${this.currentPlayer.getStylizedName()}[/u]'s turn.\n`);

         for(let i = 0; i < this.fighterList.maxPlayersPerTeam; i++){ //Prints as much names as there are team
            let fullStringVS = "[b]";
            for(let j of this.fighterList.getUsedTeams()){
                let theFighter=this.fighterList.getTeam(j)[i];
                if(theFighter != undefined){
                    this.addMessage(theFighter.outputStatus());
                }
            }
        }

        this.sendMessage();
    }

    get currentTeam():Team{
        return this.fighterList.getAlivePlayers()[this.currentTurn % this.fighterList.aliveFighterCount].assignedTeam;
    }

    get nextTeamToPlay():Team{
        return this.fighterList.getAlivePlayers()[this.currentTurn+1 % this.fighterList.aliveFighterCount].assignedTeam;
    }

    get currentPlayer():Fighter{
        return this.fighterList.getAlivePlayers()[this.currentTurn % this.fighterList.aliveFighterCount];
    }

    get nextPlayer():Fighter{
        return this.fighterList.getAlivePlayers()[this.currentTurn % this.fighterList.aliveFighterCount];
    }

    //Fight helpers
    get currentTeamName(){
        return Team[this.currentTeam];
    }

    get currentTarget():Fighter{
        return this.currentPlayer.target;
    }

    assignRandomTargetToAllFighters():void{
        for(let fighter of this.fighterList.getAlivePlayers()){
            this.assignRandomTarget(fighter);
        }
    }

    assignRandomTarget(fighter:Fighter):void{
        fighter.target = this.fighterList.getRandomFighterNotInTeam(fighter.assignedTeam);
    }

    //Dice rolling

    rollAllDice():Array<Fighter>{
        let arrSortedFightersByInitiative = new Array<Fighter>();
        for(let player of this.fighterList.getAlivePlayers()){
            player.lastDiceRoll = player.dice.roll(1);
            arrSortedFightersByInitiative.push(player);
            this.addMessage(`[color=${Team[player.assignedTeam]}]${player.name}[/color] rolled a ${player.lastDiceRoll}`);
        }

        this.sendMessage();

        arrSortedFightersByInitiative.sort((a,b):number => {
            return a.lastDiceRoll - b.lastDiceRoll;
        });

        return arrSortedFightersByInitiative;
    }

    rollAllGetWinner():Fighter{
        return this.rollAllDice()[0];
    }



    //Messaging

    addMessage(strMsg:string){
        this.message += strMsg +"\n";
    }

    sendMessage(){
        this.fChatLibInstance.sendMessage(this.message, this.channel);
        this.message = "";
    }

    //attacks

    attackFormula(tier:Tiers, actorAtk:number, targetDef:number, roll:number):number{
        return BaseDamage[Tiers[tier]]-(actorAtk-targetDef)+roll;
    }

    actionBrawl(tier:Tiers){//todo
        let action = new FightAction();
        action.tier = tier;
        action.atTurn = this.currentTurn;
        action.action = "brawl";
        action.isHold = false;
        action.attacker = this.currentPlayer;
        if(this.currentTarget == undefined){
            this.currentPlayer.target = this.fighterList.getRandomFighterNotInTeam(this.currentPlayer.assignedTeam);
        }
        action.defender = this.currentTarget;
        action.missed = true;
        action.hpDamage = 0;
        action.lustDamage = 0;
        let roll = this.currentPlayer.dice.roll(1);
        action.diceScore = roll;
        if(roll >= RequiredRoll[Tiers[tier]]){
            action.missed = false;
            this.addMessage(`${this.currentPlayer.name} rolled ${action.diceScore}, the attack [b][color=green]HITS![/color][/b]`);
        }
        else{
            this.addMessage(`${this.currentPlayer.name} rolled ${action.diceScore}, the attack [b][color=red]MISSED![/color][/b]`);
        }

        if(!action.missed){
            action.hpDamage = this.attackFormula(tier, this.currentPlayer.power, this.currentTarget.toughness, action.diceScore);
        }
        this.currentPlayer.pastActions.push(action);
        if(action.hpDamage > 0){
            this.currentTarget.hitHp(action.hpDamage);
        }

        if(this.currentTarget.isDead()){
            this.addMessage(`${this.currentTarget.name} couldn't take it anymore! [b][color=red]They're out![/color][/b]`);
        }
        else if(this.currentTarget.isSexuallyExhausted()){
            this.addMessage(`${this.currentTarget.name} is too sexually exhausted to continue! [b][color=red]They're out![/color][/b]`);
        }

        this.nextTurn();
    }

}