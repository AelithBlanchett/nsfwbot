import {Fighter} from "./Fighter";
import {Dictionary} from "./Dictionary";
import {Constants} from "./Constants";
import Team = Constants.Team;
import {Utils} from "./Utils";
import {Fight} from "./Fight";

export class TeamList extends Dictionary<Team, Array<Fighter>>{
    arrCurrentFighterForTeam:Dictionary<Team,number>;
    arrTeamsTurn:Array<Team>;

    currentTeamTurnIndex:number = 0;
    currentTeamTurn:Team;

    public constructor() {
        super();
        this.arrCurrentFighterForTeam = new Dictionary<Team,number>();
    }

    getNextTeam():Team{
        let tempIndex = this.currentTeamTurnIndex + 1;
        if (tempIndex >= this.arrTeamsTurn.length){
            tempIndex = 0;
        }
        return this.arrTeamsTurn[tempIndex];
    }

    getNextPlayer(){
        let nextTeam = this.getNextTeam();
        let teamIndex = this.arrCurrentFighterForTeam.getValue(nextTeam);;
        if(this.arrTeamsTurn.indexOf(nextTeam) == 0){
            teamIndex++;
            if(teamIndex >= this.playersPerTeam){
                teamIndex = 0;
            }
        }
        return this.getPlayerInTeamAtIndex(nextTeam, teamIndex);
    }

    nextTurn():void{
        this.currentTeamTurnIndex++;
        let nextTeam = this.arrTeamsTurn[this.currentTeamTurnIndex];
        if (nextTeam == undefined){
            this.currentTeamTurnIndex = 0;
            nextTeam = this.arrTeamsTurn[this.currentTeamTurnIndex];
            this.arrCurrentFighterForTeam.keys().forEach(x => { //choose the next player in each team
                this.arrCurrentFighterForTeam.changeValueForKey(x, this.arrCurrentFighterForTeam.getValue(x)+1);
                if(this.arrCurrentFighterForTeam.getValue(x) >= this.playersPerTeam){
                    this.arrCurrentFighterForTeam.changeValueForKey(x, 0);
                }
            });
        }
        this.currentTeamTurn = nextTeam;
    }

    resetCurrentFighters():void{
        this.arrCurrentFighterForTeam = new Dictionary<Team,number>();
        for(var team of this.getUsedTeams()){
            this.arrCurrentFighterForTeam.add(team, 0);
        }
    }

    shufflePlayers():void{
        this.arrCurrentFighterForTeam.keys().forEach(x => { //choose the next player in each team
            this.arrCurrentFighterForTeam.changeValueForKey(x, Utils.shuffleArray(this.arrCurrentFighterForTeam.getValue(x)));
        });
    }

    getTeam(team:Team):Array<Fighter>{
        if(this.keys().indexOf(team) != -1){
            return this.getValue(team);
        }
        else{
            return new Array<Fighter>();
        }
    }

    getNumberOfPlayersInTeam(team:Team):number{ // TODO: fix this
        let count = 0;
        let fullTeamList = this.getTeam(team);
        return fullTeamList.length;
    }

    getNumberOfPlayersTotal(team:Team):number{
        let count = 0;
        for(let i = 0; i < this.teamsInvolved; i++){
            count += this.getValue(this.keys()[i]).length;
        }
        return count;
    }

    getPlayerInTeamAtIndex(team:Team, index:number):Fighter{
        let indexOfTeam = this.keys().indexOf(team);
        if(indexOfTeam != -1){
            let teamList = this.getValue(this.keys()[indexOfTeam]);
            if(teamList[index] != undefined){
                return teamList[index];
            }
        }
        return;
    }

    getUsedTeams():Array<Team>{
        let teamsList:Array<Team> = this.getTeamsIdList();
        let arrUsedTeamOrNot:Array<boolean> = [];
        for(var team of teamsList){
            arrUsedTeamOrNot[team] = false;
            if((this.getNumberOfPlayersInTeam(Team[Team[team]]) > 0)){
                arrUsedTeamOrNot[team] = true;
            }
        }
        let usedTeams:Array<Team> = [];
        for(var i = 0; i<arrUsedTeamOrNot.length; i++){
            if(arrUsedTeamOrNot[i]){
                usedTeams.push(i);
            }
        }

        if(usedTeams.length == 0){
            usedTeams.push(Team.Blue);
        }
        if(usedTeams.length == 1){
            if(usedTeams.indexOf(Team.Red) == -1){
                usedTeams.push(Team.Red);
            }
            else{
                usedTeams.push(Team.Blue);
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

    getRandomTeamNumber():Team{
        return Utils.getRandomInt(0, this.teamsInvolved) as Team;
    }

    get teamsInvolved():number{
        return this.keys().length;
    }

    get playersPerTeam():number{ //returns 0 if there aren't any teams
        let number = 0;
        if(this.keys().length > 0){
            number = this.getValue(this.keys()[0]).length;
        }
        return number;
    }

    isEveryoneReady():boolean{
        let isEveryoneReady = true;
        for(let teamsList of this.values()){
            for(let fighter of teamsList){
                if(!fighter.isReady){
                    isEveryoneReady = false;
                }
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
        let randomTeamNumber = this.getRandomTeamNumber();
        return this.getPlayerInTeamAtIndex(randomTeamNumber, Utils.getRandomInt(0,this.getTeam(randomTeamNumber).length));
    }

    getFighter(name):Fighter{
        let allFighters = this.getAllPlayers();
        for(let fighter of allFighters){
            if(fighter.name == name){
                return fighter;
            }
        }
        return;
    }

    //Misc. shortcuts
    get fighterCount():number {
        return this.teamsInvolved * this.playersPerTeam;
    }

    getAllPlayers():Array<Fighter>{
        let arrResult:Array<Fighter> = [];
        for(let team of this.getUsedTeams()){
            if(this.getValue(team) != undefined){
                for(let i = 0; i < this.getValue(team).length; i++){
                    let tempFighter = this.getPlayerInTeamAtIndex(team, i);
                    arrResult.push(tempFighter);
                }
            }
        }
        return arrResult;
    }
}