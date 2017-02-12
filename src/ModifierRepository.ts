import {Action} from "./Action";
import {Model} from "./Model";
import {Utils} from "./Utils";
import {Modifier} from "./Modifier";

export class ModifierRepository{

    public static async persist(modifier:Modifier):Promise<void>{
        try
        {
            if(!await ModifierRepository.exists(modifier.id)){
                await Model.db('nsfw_modifiers').insert(
                    {
                        idModifier: modifier.id,
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
                        idParentActions: modifier.parentActionIds,
                        createdAt: new Date()
                    }).into("nsfw_modifiers");
            }
            else{
                await Model.db('nsfw_modifiers').where({idModifier: modifier.id}).update(
                    {
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
                        idParentActions: modifier.parentActionIds,
                        updatedAt: new Date()
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
            let loadedData = await Model.db('nsfw_modifiers').where({idFight: idFight}).and.whereNotNull('deletedAt').select();

            for(let data of loadedData){
                let action = new Modifier();
                Utils.mapChildren(data, action);
                loadedModifiers.push(action);
            }

        }
        catch(ex){
            throw ex;
        }

        return loadedModifiers;
    }

    public static async exists(idModifier:string):Promise<boolean>{
        let loadedData = await Model.db('nsfw_modifiers').where({idModifier: idModifier}).select();
        return (loadedData.length > 0);
    }

    public static async delete(idModifier:string):Promise<void>{
        try{
            await Model.db('nsfw_modifiers').where({idModifier: idModifier}).update({
                deletedAt: new Date()
            });
        }
        catch(ex){
            throw ex;
        }
    }

}