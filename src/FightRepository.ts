
import {Fight} from "./Fight";
import {Model} from "./Model";
import {Action} from "./Action";
import {ActionRepository} from "./ActionRepository";
import {Utils} from "./Utils";
import {ActiveFighterRepository} from "./ActiveFighterRepository";

export class FightRepository{

    public static async persist(fight:Fight):Promise<void>{
        try
        {
            let currentSeason = await Model.db('nsfw_constants').where({key: "currentSeason"}).first();

            if(!await FightRepository.exists(fight.id)){
                await Model.db('nsfw_fights').insert({
                    idFight: fight.id,
                    idFightType: fight.fightType,
                    idStage: fight.stage,
                    currentTurn: fight.currentTurn,
                    hasStarted: fight.hasStarted,
                    hasEnded: fight.hasEnded,
                    winnerTeam: fight.winnerTeam,
                    season: fight.season,
                    createdAt: new Date()
                });
            }
            else{
                await Model.db('nsfw_fights').where({idFight: fight.id, season: currentSeason.value}).update({
                    idFightType: fight.fightType,
                    idStage: fight.stage,
                    currentTurn: fight.currentTurn,
                    hasStarted: fight.hasStarted,
                    hasEnded: fight.hasEnded,
                    winnerTeam: fight.winnerTeam,
                    updatedAt: new Date()
                });
            }
        }
        catch(ex){
            throw ex;
        }
    }


    public static async exists(idFight:string):Promise<boolean>{
        let loadedData = await Model.db('nsfw_fights').where({idFight: idFight}).and.whereNotNull('deletedAt').select();
        return (loadedData.length > 0);
    }

    public static async load(idFight:string):Promise<Fight>{
        let loadedFight:Fight = new Fight();

        if(!await FightRepository.exists(idFight)){
            return null;
        }

        try
        {
            let loadedData = await Model.db('nsfw_fights').where({idFight: idFight}).and.whereNotNull('deletedAt').select();
            let data = loadedData[0];

            Utils.mapChildren(loadedFight, data);

            loadedFight.fighters = await ActiveFighterRepository.loadFromFight(idFight);

            loadedFight.pastActions = await FightRepository.loadActions(loadedFight);
        }
        catch(ex){
            throw ex;
        }

        return loadedFight;
    }

    public static async loadActions(fight:Fight):Promise<Action[]>{
        let loadedActions:Action[] = [];

        if(!await FightRepository.exists(fight.id)){
            return null;
        }

        try
        {
            loadedActions = await ActionRepository.loadFromFight(fight.id);

            for(let action of loadedActions){
                let attackingFighterIndex = fight.fighters.findIndex(x => x.name == action.idAttacker);
                let defendingFighterIndex = fight.fighters.findIndex(x => x.name == action.idDefender);

                if(attackingFighterIndex != -1){
                    fight.fighters[attackingFighterIndex].actionsDone.push(action);
                }

                if(defendingFighterIndex != -1){
                    fight.fighters[defendingFighterIndex].actionsInflicted.push(action);
                }
            }

        }
        catch(ex){
            throw ex;
        }

        return loadedActions;
    }


    public static async delete(idFight:string):Promise<void>{
        await Model.db('nsfw_fights').where({idFight: idFight}).update({
            deletedAt: new Date()
        });
    }

}