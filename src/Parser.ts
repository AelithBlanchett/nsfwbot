import {Utils} from "./Utils";
import * as Constants from "./Constants";
import Team = Constants.Team;
import Tier = Constants.Tier;
import Stats = Constants.Stats;
import StatTier = Constants.StatTier;
import {FightType} from "./Constants";
import {FeatureType} from "./Constants";

export class Commands{

    public static join(args){
        let teams = Utils.getEnumList(Team);
        for(let teamId in teams){
            teams[teamId] = teams[teamId].toLowerCase();
        }
        let indexOfTeam = teams.indexOf(args.toLowerCase());
        if(indexOfTeam != -1){
            return Team[Team[indexOfTeam]];
        }
        return Team.Unknown;
    }

    public static addStat(args){
        let stats = Utils.getEnumList(Stats);
        for(let statId in stats){
            stats[statId] = stats[statId].toLowerCase();
        }
        let indexOfStat = stats.indexOf(args.toLowerCase());
        if(indexOfStat != -1){
            return Stats[Stats[indexOfStat]];
        }
        return -1;
    }

    private static isInt(value) {
        return !isNaN(value) && (function (x) {
                return (x | 0) === x;
            })(parseFloat(value))
    }

    public static checkIfValidStats(strParameters:string, numberOfRequiredPoints:number):string {
        let arrParam:Array<number> = [];

        for(let nbr of strParameters.split(",")){
            arrParam.push(parseInt(nbr));
        }

        if (arrParam.length != 6) {
           return "The number of parameters was incorrect. Example: !register 30,30,30,30,30,50";
        }
        else if (!arrParam.every(arg => Commands.isInt(arg))) {
            return "All the parameters aren't integers. Example: !register 30,30,30,30,30,50";
        }
        else {
            //register
            let total = 0;
            total = arrParam.reduce(function (a, b) {
                return a + b;
            }, 0);
            if (total != numberOfRequiredPoints) {
                return "The total of points you've spent isn't equal to "+numberOfRequiredPoints+". (" + total + "). Example: !register 30,30,30,30,30,50";
            }
            else if (arrParam[0] > 100 || (arrParam[0] < 1)) {
                return "The Power stat must be higher than 0 and lower than 100. Example: !register 30,30,30,30,30,50";
            }
            else if (arrParam[1] > 100 || (arrParam[1] < 1)) {
                return "The Sensuality stat must be higher than 0 and lower than 100. Example: !register 30,30,30,30,30,50";
            }
            else if (arrParam[2] > 100 || (arrParam[2] < 1)) {
                return "The Toughness stat must be higher than 0 and lower than 100. Example: !register 30,30,30,30,30,50";
            }
            else if (arrParam[3] > 100 || (arrParam[3] < 1)) {
                return "The Endurance stat must be higher than 0 and lower than 100. Example: !register 30,30,30,30,30,50";
            }
            else if (arrParam[4] > 100 || (arrParam[4] < 1)) {
                return "The Dexterity stat must be higher than 0 and lower than 100. Example: !register 30,30,30,30,30,50";
            }
            else if (arrParam[5] > 100 || (arrParam[5] < 1)) {
                return "The Willpower stat must be higher than 0 and lower than 100. Example: !register 30,30,30,30,30,50";
            }
            else {
                return "";
            }
        }
    }

    public static getFeatureType(args, onlyType:boolean = false){
        let result = {featureType: null, turns: -1, message: null};
        let splittedArgs = args.split(" ");
        let typeToSearch = splittedArgs[0];
        let turns = 0;

        if(splittedArgs.length > 1 && !onlyType){
            if(isNaN(splittedArgs[1]) || splittedArgs[1] <= 0 || splittedArgs[1] > 10){
                result.message = "The number of fights specified is invalid. It must be a number > 0 and <= 10";
                return result;
            }
            else{
                result.turns = splittedArgs[1];
            }
        }
        else{
            result.turns = 0;
        }

        let featTypes = Utils.getEnumList(FeatureType);
        for(let featTypeId in featTypes){
            featTypes[featTypeId] = featTypes[featTypeId].toLowerCase();
        }
        let indexOfFeatType = featTypes.indexOf(typeToSearch.toLowerCase());
        if(indexOfFeatType != -1){
            result.featureType =  FeatureType[FeatureType[indexOfFeatType]];
        }
        else{
            result.message = "This feature doesn't exist.";
        }
        return result;
    }

    public static setFightType(args){
        let fightTypes = Utils.getEnumList(FightType);
        for(let fightTypeId in fightTypes){
            fightTypes[fightTypeId] = fightTypes[fightTypeId].toLowerCase();
        }
        let indexOfFightType = fightTypes.indexOf(args.toLowerCase());
        if(indexOfFightType != -1){
            return FightType[FightType[indexOfFightType]];
        }
        return -1;
    }

    public static setTeamsCount(args){
        if(isNaN(args)){
            return -1;
        }
        return Number(args);
    }
}