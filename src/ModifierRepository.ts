import {Action} from "./Action";
import {Model} from "./Model";
import {Utils} from "./Utils";
import {Modifier} from "./Modifier";
import {EmptyModifier} from "./CustomModifiers";

export class ModifierRepository{

    public static async persist(modifier:Modifier):Promise<void>{
        try
        {
            if(!await ModifierRepository.exists(modifier.idModifier)){
                modifier.createdAt = new Date();
                await Model.db('nsfw_modifiers').insert(
                    {
                        idModifier: modifier.idModifier,
                        idFight: modifier.idFight,
                        idReceiver: modifier.idReceiver,
                        idApplier: modifier.idApplier,
                        name: modifier.name,
                        tier: modifier.tier,
                        type: modifier.type,
                        focusDamage: modifier.focusDamage,
                        hpDamage: modifier.hpDamage,
                        lustDamage: modifier.lustDamage,
                        areDamageMultipliers: modifier.areDamageMultipliers,
                        diceRoll: modifier.diceRoll,
                        escapeRoll: modifier.escapeRoll,
                        uses: modifier.uses,
                        event: modifier.event,
                        timeToTrigger: modifier.timeToTrigger,
                        idParentActions: modifier.idParentActions.join(";"),
                        createdAt: modifier.createdAt
                    }).into("nsfw_modifiers");
            }
            else{
                modifier.updatedAt = new Date();
                await Model.db('nsfw_modifiers').where({idModifier: modifier.idModifier}).update(
                    {
                        idFight: modifier.idFight,
                        idReceiver: modifier.idReceiver,
                        idApplier: modifier.idApplier,
                        name: modifier.name,
                        tier: modifier.tier,
                        type: modifier.type,
                        focusDamage: modifier.focusDamage,
                        hpDamage: modifier.hpDamage,
                        lustDamage: modifier.lustDamage,
                        areDamageMultipliers: modifier.areDamageMultipliers,
                        diceRoll: modifier.diceRoll,
                        escapeRoll: modifier.escapeRoll,
                        uses: modifier.uses,
                        event: modifier.event,
                        timeToTrigger: modifier.timeToTrigger,
                        idParentActions: JSON.stringify(modifier.idParentActions),
                        updatedAt: modifier.updatedAt
                    }).into("nsfw_modifiers");
            }

        }
        catch(ex){
            throw ex;
        }
    }

    public static async loadFromFight(idFight:string):Promise<Modifier[]>{
        let loadedModifiers:Modifier[] = [];

        try
        {
            let loadedData = await Model.db('nsfw_modifiers').where({idFight: idFight}).and.whereNull('deletedAt').select();

            for(let data of loadedData){
                let modifier = new EmptyModifier();
                Utils.mergeFromTo(data, modifier);
                modifier.idParentActions = [];
                if(data.idParentActions != null){
                    for(let id of data.idParentActions.split(";")){
                        modifier.idParentActions.push(id);
                    }
                }
                loadedModifiers.push(modifier);
            }

        }
        catch(ex){
            throw ex;
        }

        return loadedModifiers;
    }

    public static async exists(idModifier:string):Promise<boolean>{
        let loadedData = await Model.db('nsfw_modifiers').where({idModifier: idModifier}).and.whereNull('deletedAt').select();
        return (loadedData.length > 0);
    }

    public static async delete(idModifier:string):Promise<void>{
        try{
            await Model.db('nsfw_modifiers').where({idModifier: idModifier}).and.whereNull('deletedAt').update({
                deletedAt: new Date()
            });
        }
        catch(ex){
            throw ex;
        }
    }

    public static async deleteFromFight(idFight:string):Promise<void>{
        try{
            await Model.db('nsfw_modifiers').where({idFight: idFight}).and.whereNull('deletedAt').update({
                deletedAt: new Date()
            });
        }
        catch(ex){
            throw ex;
        }
    }

}