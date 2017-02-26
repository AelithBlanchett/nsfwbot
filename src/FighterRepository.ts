import {Model} from "./Model";
import {Fighter} from "./Fighter";
import {Achievement} from "./Achievement";
import {Feature} from "./Feature";
import {Utils} from "./Utils";

export class FighterRepository{

    public static async persist(fighter:Fighter):Promise<void>{
        try
        {
            let currentSeason = await Model.db('nsfw_constants').where({key: "currentSeason"}).first();

            if(!await FighterRepository.exists(fighter.name)){
                fighter.createdAt = new Date();
                await Model.db('nsfw_fighters').insert({
                    name: fighter.name,
                    season: currentSeason.value,
                    power: fighter.power,
                    sensuality: fighter.sensuality,
                    dexterity: fighter.dexterity,
                    toughness: fighter.toughness,
                    endurance: fighter.endurance,
                    willpower: fighter.willpower,
                    areStatsPrivate: fighter.areStatsPrivate,
                    tokens: fighter.tokens,
                    tokensSpent: fighter.tokensSpent,
                    createdAt: fighter.createdAt
                });
            }
            else{
                fighter.updatedAt = new Date();
                await Model.db('nsfw_fighters').where({name: fighter.name, season: currentSeason.value}).update({
                    power: fighter.power,
                    sensuality: fighter.sensuality,
                    dexterity: fighter.dexterity,
                    toughness: fighter.toughness,
                    endurance: fighter.endurance,
                    willpower: fighter.willpower,
                    areStatsPrivate: fighter.areStatsPrivate,
                    tokens: fighter.tokens,
                    tokensSpent: fighter.tokensSpent,
                    updatedAt: fighter.updatedAt
                });

                FighterRepository.persistFeatures(fighter);
                FighterRepository.persistAchievements(fighter);
            }
        }
        catch(ex){
            throw ex;
        }
    }

    public static async persistFeatures(fighter:Fighter):Promise<void>{

        let featuresIdToKeep = [];
        let currentSeason = await Model.db('nsfw_constants').where({key: "currentSeason"}).first();

        for(let feature of fighter.features){
            if(!feature.isExpired() && feature.deletedAt == null){
                featuresIdToKeep.push(feature.id);
            }

            let loadedData = await Model.db('nsfw_fighters_features').where({idFighter: fighter.name, idFeature: feature.id}).select();
            if(loadedData.length == 0){
                feature.createdAt = new Date();
                await Model.db('nsfw_fighters_features').insert({
                    idFeature: feature.id,
                    idFighter: fighter.name,
                    season: currentSeason,
                    type: feature.type,
                    uses: feature.uses,
                    permanent: feature.permanent,
                    createdAt: feature.createdAt
                });
            }
            else{
                feature.updatedAt = new Date();
                await Model.db('nsfw_fighters_features').where({idFighter: fighter.name, idFeature: feature.id}).update({
                    season: currentSeason,
                    type: feature.type,
                    uses: feature.uses,
                    permanent: feature.permanent,
                    updatedAt: feature.updatedAt
                });
            }

        }

        await Model.db('nsfw_fighters_features').where('idFighter', fighter.name).whereNull('deletedAt').whereNotIn('idFeature', featuresIdToKeep).update({
            deletedAt: new Date()
        });

        for(let id of featuresIdToKeep){
            let index = fighter.features.findIndex(x => x.id == id);
            if(index != -1){
                fighter.features.splice(index, 1);
            }
        }
    }

    public static async persistAchievements(fighter:Fighter):Promise<void>{

        for(let achievement of fighter.achievements){
            let loadedData = await Model.db('nsfw_fighters_achievements').where({idFighter: fighter.name, idAchievement: achievement.type}).select();

            if(loadedData.length == 0){
                achievement.createdAt = new Date();
                await Model.db('nsfw_fighters_achievements').insert({
                    idAchievement: achievement.type,
                    idFighter: fighter.name,
                    createdAt: achievement.createdAt
                });
            }
        }

    }

    public static async exists(name:string):Promise<boolean>{
        let currentSeason = await Model.db('nsfw_constants').where({key: "currentSeason"}).first();
        let loadedData = await Model.db('nsfw_v_fighters').where({name: name, season: currentSeason.value}).and.whereNull('deletedAt').select();
        return (loadedData.length > 0);
    }

    public static async load(name:string):Promise<Fighter>{
        let loadedFighter:Fighter = new Fighter();

        if(!await FighterRepository.exists(name)){
            return null;
        }

        try
        {
            let currentSeason = await Model.db('nsfw_constants').where({key: "currentSeason"}).first();

            let loadedData = await Model.db('nsfw_v_fighters').where({name: name, season: currentSeason.value}).and.whereNull('deletedAt').select();
            let data = loadedData[0];

            Utils.mergeFromTo(data, loadedFighter);

            loadedFighter.achievements = await FighterRepository.loadAllAchievements(name);
            loadedFighter.features = await FighterRepository.loadAllFeatures(name, currentSeason.value);
        }
        catch(ex){
            throw ex;
        }

        return loadedFighter;
    }

    static async loadAllAchievements(fighterName:string):Promise<Achievement[]>{
        let result;

        try{
            result = await Model.db('nsfw_fighters_achievements').select('idAchievement', 'createdAt').where({idFighter: fighterName});
        }
        catch(ex){
            throw ex;
        }

        let achievementsArray:Achievement[] = [];
        for(let row of result){
            achievementsArray.push(new Achievement(parseInt(row.idAchievement), row.createdAt));
        }
        return achievementsArray;
    }

    static async loadAllFeatures(fighterName:string, season:number):Promise<Feature[]>{
        let result;

        try{
            result = await Model.db('nsfw_fighters_features').where({idFighter: fighterName, season: season}).and.whereNull('deletedAt').select();
        }
        catch(ex){
            throw ex;
        }

        let featuresArray:Feature[] = [];
        for(let row of result){
            featuresArray.push(new Feature(fighterName, row.type, row.uses, row.idFeature));
        }
        return featuresArray;
    }

    public static async delete(name:string):Promise<void>{
        let currentSeason = await Model.db('nsfw_constants').where({key: "currentSeason"}).first();
        await Model.db('nsfw_fighters').where({name: name, season: currentSeason.value}).and.whereNull('deletedAt').update({
            deletedAt: new Date()
        });
    }

}