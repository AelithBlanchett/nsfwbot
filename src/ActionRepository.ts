

import {Action} from "./Action";
import {Model} from "./Model";
export class ActionRepository{

    public static async persist(action:Action):Promise<void>{
        let id = "";
        try
        {
            if(action.idAction == ""){
                id = await Model.db('nsfw_actions').returning('idAction').insert(
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
                action.idAction = id;
            }
            else{
                id = await Model.db('nsfw_actions').where({idAction: action.idAction}).update(
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

    public static async delete(actionId:string):Promise<void>{
        try{
            await Model.db('nsfw_actions').where({idAction: actionId}).del();
        }
        catch(ex){
            throw ex;
        }
    }

}