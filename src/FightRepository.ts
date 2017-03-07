
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

            if(!await FightRepository.exists(fight.idFight)){
                fight.createdAt = new Date();
                await Model.db('nsfw_fights').insert({
                    idFight: fight.idFight,
                    fightType: fight.fightType,
                    stage: fight.stage,
                    currentTurn: fight.currentTurn,
                    hasStarted: fight.hasStarted,
                    hasEnded: fight.hasEnded,
                    winnerTeam: fight.winnerTeam,
                    season: fight.season,
                    createdAt: fight.createdAt
                });
            }
            else{
                fight.updatedAt = new Date();
                await Model.db('nsfw_fights').where({idFight: fight.idFight, season: currentSeason.value}).update({
                    fightType: fight.fightType,
                    stage: fight.stage,
                    currentTurn: fight.currentTurn,
                    hasStarted: fight.hasStarted,
                    hasEnded: fight.hasEnded,
                    winnerTeam: fight.winnerTeam,
                    updatedAt: fight.updatedAt
                });
            }

            for(let fighter of fight.fighters){
                ActiveFighterRepository.persist(fighter);
            }
        }
        catch(ex){
            throw ex;
        }
    }


    public static async exists(idFight:string):Promise<boolean>{
        let loadedData = await Model.db('nsfw_fights').where({idFight: idFight}).and.whereNull('deletedAt').select();
        return (loadedData.length > 0);
    }

    public static async load(idFight:string):Promise<Fight>{
        let loadedFight:Fight = new Fight();

        if(!await FightRepository.exists(idFight)){
            return null;
        }

        try
        {
            let loadedData = await Model.db('nsfw_fights').where({idFight: idFight}).and.whereNull('deletedAt').select();
            let data = loadedData[0];

            Utils.mergeFromTo(data, loadedFight);

            loadedFight.fighters = await ActiveFighterRepository.loadFromFight(idFight);
            loadedFight.pastActions = await FightRepository.loadActions(loadedFight);

            for(let fighter of loadedFight.fighters){
                fighter.fight = loadedFight;
            }
        }
        catch(ex){
            throw ex;
        }

        return loadedFight;
    }

    public static async loadActions(fight:Fight):Promise<Action[]>{
        let loadedActions:Action[] = [];

        if(!await FightRepository.exists(fight.idFight)){
            return null;
        }

        try
        {
            loadedActions = await ActionRepository.loadFromFight(fight.idFight);

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