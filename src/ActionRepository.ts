

import {Action} from "./Action";
import {Model} from "./Model";
import {Utils} from "./Utils";
export class ActionRepository{

    public static async persist(action:Action):Promise<void>{
        try
        {
            if(!await ActionRepository.exists(action.idAction)){
                await Model.db('nsfw_actions').insert(
                    {
                        idAction: action.idAction,
                        idFight: action.idFight,
                        atTurn: action.atTurn,
                        type: action.type,
                        tier: action.tier,
                        isHold: action.isHold,
                        diceScore: action.diceScore,
                        missed: action.missed,
                        idAttacker: action.idAttacker,
                        idDefender: action.idDefender,
                        hpDamageToDef: action.hpDamageToDef,
                        lpDamageToDef: action.fpDamageToDef,
                        fpDamageToDef: action.lpDamageToDef,
                        hpDamageToAtk: action.hpDamageToAtk,
                        lpDamageToAtk: action.fpDamageToAtk,
                        fpDamageToAtk: action.lpDamageToAtk,
                        hpHealToDef: action.hpHealToDef,
                        lpHealToDef: action.fpHealToDef,
                        fpHealToDef: action.lpHealToDef,
                        hpHealToAtk: action.hpHealToAtk,
                        lpHealToAtk: action.fpHealToAtk,
                        fpHealToAtk: action.lpHealToAtk,
                        requiresRoll: action.requiresRoll,
                        createdAt: action.createdAt
                    }).into("nsfw_actions");
            }
            else{
                await Model.db('nsfw_actions').where({idAction: action.idAction}).update(
                    {
                        idFight: action.idFight,
                        atTurn: action.atTurn,
                        type: action.type,
                        tier: action.tier,
                        isHold: action.isHold,
                        diceScore: action.diceScore,
                        missed: action.missed,
                        idAttacker: action.idAttacker,
                        idDefender: action.idDefender,
                        hpDamageToDef: action.hpDamageToDef,
                        lpDamageToDef: action.fpDamageToDef,
                        fpDamageToDef: action.lpDamageToDef,
                        hpDamageToAtk: action.hpDamageToAtk,
                        lpDamageToAtk: action.fpDamageToAtk,
                        fpDamageToAtk: action.lpDamageToAtk,
                        hpHealToDef: action.hpHealToDef,
                        lpHealToDef: action.fpHealToDef,
                        fpHealToDef: action.lpHealToDef,
                        hpHealToAtk: action.hpHealToAtk,
                        lpHealToAtk: action.fpHealToAtk,
                        fpHealToAtk: action.lpHealToAtk,
                        requiresRoll: action.requiresRoll,
                        createdAt: action.createdAt
                    }).into("nsfw_actions");
            }

        }
        catch(ex){
            throw ex;
        }
    }

    public static async loadFromFight(idFight:string):Promise<Action[]>{
        let loadedActions:Action[] = [];

        try
        {
            let loadedData = await Model.db('nsfw_actions').where({idFight: idFight}).select();

            for(let data of loadedData){
                let action = new Action();
                Utils.mapChildren(data, action);
                loadedActions.push(action);
            }

        }
        catch(ex){
            throw ex;
        }

        return loadedActions;
    }

    public static async exists(idAction:string):Promise<boolean>{
        let loadedData = await Model.db('nsfw_actions').where({idAction: idAction}).select();
        return (loadedData.length > 0);
    }

    public static async delete(actionId:string):Promise<void>{
        try{
            await Model.db('nsfw_actions').where({idAction: actionId}).del();
        }
        catch(ex){
            throw ex;
        }
    }

}