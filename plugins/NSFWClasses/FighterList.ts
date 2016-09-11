import {Fighter} from "./Fighter";
import {Dictionary} from "./Dictionary";
import {Constants} from "./Constants";
import Team = Constants.Team;
import {Utils} from "./Utils";
import {Fight} from "./Fight";

export class FighterList extends Array<Fighter>{

    public constructor() {
        super();
    }

    reorderFightersByInitiative(arrFightersSortedByInitiative:Array<Fighter>){
        var index = 0;
        for(let fighter of arrFightersSortedByInitiative){
            let indexToMoveInFront = this.getIndexOfPlayer(fighter);
            var temp = this[index];
            this[index] = this[indexToMoveInFront];
            this[indexToMoveInFront] = temp;
            index++;
        }
    }

    getAlivePlayers():Array<Fighter>{
        let arrPlayers = new Array<Fighter>();
        for(let player of this){
            if(!player.isTechnicallyOut() && player.isInTheRing){
                arrPlayers.push(player);
            }
        }
        return arrPlayers;
    }

    getFighterByID(id:number){
        let player = null;
        for(let playa of this){
            if(playa.id == id){
                player = playa;
            }
        }
        return player;
    }

    getFighterByName(name:string){
        let fighter = null;
        for(let player of this){
            if(player.name == name){
                fighter = player;
            }
        }
        return fighter;
    }

    getIndexOfPlayer(fighter:Fighter){
        let index = -1;
        for(let i = 0; i < this.length; i++){
            if(this[i].id == fighter.id){
                index = i;
            }
        }
        return index;
    }

    getFirstPlayerIDAliveInTeam(team:Team, afterIndex:number = 0):number{
        let fullTeam = this.getTeam(team);
        var index = -1;
        for(let i = afterIndex; i < fullTeam.length; i++){
            if(fullTeam[i] != undefined && !fullTeam[i].isTechnicallyOut() && fullTeam[i].isInTheRing){
                index = i;
            }
        }
        return index;
    }

    shufflePlayers():void{
        for (var i = 0; i < this.length - 1; i++) {
            var j = i + Math.floor(Math.random() * (this.length - i));

            var temp = this[j];
            this[j] = this[i];
            this[i] = temp;
        }
    }

    getTeam(team:Team):Array<Fighter>{
        let teamList = new Array<Fighter>();
        for(let player of this){
            if(player.assignedTeam == team){
                teamList.push(player);
            }
        }
        return teamList;
    }

    getNumberOfPlayersInTeam(team:Team):number{
        let count = 0;
        let fullTeamCount = this.getTeam(team);
        return fullTeamCount.length;
    }

    getUsedTeams():Array<Team>{
        let usedTeams:Array<Team> = [];
        for(let player of this.getAlivePlayers()){
            if(usedTeams.indexOf(player.assignedTeam) == -1){
                usedTeams.push(player.assignedTeam);
            }
        }
        return usedTeams;
    }

    getTeamsIdList():Array<number>{
        let arrResult = [];
        for (var enumMember in Team) {
            var isValueProperty = parseInt(enumMember, 10) >= 0;
            if (isValueProperty) {
                arrResult.push(enumMember);
            }
        }
        return arrResult;
    }

    getRandomTeam():Team{
        return this.getUsedTeams()[Utils.getRandomInt(0, this.numberOfTeamsInvolved)];
    }

    get numberOfTeamsInvolved():number{
        return this.getUsedTeams().length;
    }

    get numberOfPlayersPerTeam():Array<number>{
        let count = Array<number>();
        for(let player of this){
            if(count[player.assignedTeam] == undefined){
                count[player.assignedTeam] = 1;
            }
            else{
                count[player.assignedTeam] = count[player.assignedTeam]+1;
            }
        }
        return count;
    }

    get maxPlayersPerTeam():number{ //returns 0 if there aren't any teams
        let maxCount = 0;
        for(let nb of this.numberOfPlayersPerTeam){
            if(nb > maxCount){
                maxCount = nb;
            }
        }
        return maxCount;
    }

    isEveryoneReady():boolean{
        let isEveryoneReady = true;
        for(let fighter of this){
            if(!fighter.isReady){
                isEveryoneReady = false;
            }
        }
        return isEveryoneReady;
    }

    getAvailableTeam():Team{
        let teamToUse:Team = Team.Blue;
        let arrPlayersCount = new Dictionary<Team, number>();
        let usedTeams= this.getUsedTeams();
        for(var teamId of usedTeams){
            arrPlayersCount.add(teamId as Team, this.getNumberOfPlayersInTeam(Team[Team[teamId]]));
        }

        let mostPlayersInTeam = Math.max(...arrPlayersCount.values());
        let leastPlayersInTeam = Math.min(...arrPlayersCount.values());
        let indexOfFirstEmptiestTeam = arrPlayersCount.values().indexOf(leastPlayersInTeam);

        if(mostPlayersInTeam == leastPlayersInTeam){
            teamToUse = Team.Blue;
        }
        else{
            teamToUse = Team[Team[indexOfFirstEmptiestTeam]];
        }

        return teamToUse;
    }

    getRandomFighter():Fighter{
        return this.getAlivePlayers()[Utils.getRandomInt(0,this.getAlivePlayers().length)];
    }

    getRandomFighterNotInTeam(team:Team):Fighter{
        let tries = 0;
        let fighter:Fighter;
        while(tries < 99 && (fighter == undefined || fighter.assignedTeam == undefined || fighter.assignedTeam == team)){
            fighter = this.getRandomFighter();
            tries++;
        }
        return fighter;
    }


    //Misc. shortcuts
    get fighterCount():number {
        return this.length;
    }

    get aliveFighterCount():number{
        return this.getAlivePlayers().length;
    }

    //getAllPlayers():Array<Fighter>{
    //    return this;
    //}
}