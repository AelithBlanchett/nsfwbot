import {Utils} from "./Utils";
import {Fight} from "./Fight";
import * as Constants from "./Constants";
import Team = Constants.Team;
import Tier = Constants.Tier;
import Stats = Constants.Stats;
import StatTier = Constants.StatTier;
import {FightType} from "./Constants";
var _ = require('lodash');

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



//public static register(args){
//    let result = {success: false, args: {power: 0, dexterity: 0, toughness: 0, endurance: 0, willpower: 0}};
//
//    let splittedArgs = args.split(" ");
//    if(splittedArgs.length == 5){
//        result.success = true;
//
//        for(let i of splittedArgs){
//            if(!Number.isInteger(i)){
//                result.success = false;
//            }
//        }
//
//        if(result.success){ //it means every argument is an integer
//            result.args.power = splittedArgs[0] as number;
//            result.args.dexterity = splittedArgs[1] as number;
//            result.args.toughness = splittedArgs[2] as number;
//            result.args.endurance = splittedArgs[3] as number;
//            result.args.willpower = splittedArgs[4] as number;
//            for(let i in result.args){
//                if(result.args[i] < Constants.minLevel || result.args[i] > Constants.maxLevel){
//                    result.success = false;
//                }
//            }
//        }
//    }
//
//    return result;
//}