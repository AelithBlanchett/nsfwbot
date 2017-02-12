import {Model} from "./Model";
import {Fighter} from "./Fighter";
import {Achievement} from "./Achievement";
import {Feature} from "./Feature";

export class FighterRepository{

    public static async persist(fighter:Fighter):Promise<void>{
        try
        {
            let currentSeason = await Model.db('nsfw_constants').where({key: "currentSeason"}).first();

            if(!await FighterRepository.exists(fighter.name)){
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
                    tokensSpent: fighter.tokensSpent
                });
            }
            else{
                await Model.db('nsfw_fighters').where({name: fighter.name, season: currentSeason.value}).update({
                    power: fighter.power,
                    sensuality: fighter.sensuality,
                    dexterity: fighter.dexterity,
                    toughness: fighter.toughness,
                    endurance: fighter.endurance,
                    willpower: fighter.willpower,
                    areStatsPrivate: fighter.areStatsPrivate,
                    tokens: fighter.tokens,
                    tokensSpent: fighter.tokensSpent
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
            if(!feature.isExpired()){
                featuresIdToKeep.push(feature.id);
            }

            let loadedData = await Model.db('nsfw_fighters_features').where({idFighter: fighter.name, idFeature: feature.id}).select();
            if(loadedData.length > 0){
                await Model.db('nsfw_fighters_features').insert({
                    idFeature: feature.id,
                    idFighter: fighter.name,
                    season: currentSeason,
                    type: feature.type,
                    uses: feature.uses,
                    permanent: feature.permanent,
                    createdAt: new Date()
                });
            }
            else{
                await Model.db('nsfw_fighters_features').where({idFighter: fighter.name, idFeature: feature.id}).update({
                    season: currentSeason,
                    type: feature.type,
                    uses: feature.uses,
                    permanent: feature.permanent,
                    updatedAt: new Date()
                });
            }

        }

        await Model.db('nsfw_fighters_features').where('idFighter', fighter.name).whereNull('deletedAt').whereNotIn('idFeature', featuresIdToKeep).update({
            deletedAt: new Date()
        });
    }

    public static async persistAchievements(fighter:Fighter):Promise<void>{

        for(let achievement of fighter.achievements){
            let loadedData = await Model.db('nsfw_fighters_achievements').where({idFighter: fighter.name, idAchievement: achievement.type}).select();

            if(loadedData.length < 1){
                await Model.db('nsfw_fighters_achievements').insert({
                    idAchievement: achievement.type,
                    idFighter: fighter.name,
                    createdAt: new Date()
                });
            }
        }

    }

    public static async exists(name:string):Promise<boolean>{
        let loadedData = await Model.db('nsfw_v_fighters').where({name: name}).select();
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

            let loadedData = await Model.db('nsfw_v_fighters').where({name: name, season: currentSeason.value}).select();
            let data = loadedData[0];

            for(let prop of Object.getOwnPropertyNames(data)){
                if(Object.getOwnPropertyNames(loadedFighter).indexOf(prop) != -1){
                    if(typeof data[prop] != "function"){
                        loadedFighter[prop] = data[prop];
                    }
                }
            }

            loadedFighter.achievements = await FighterRepository.loadAllAchievements(name, currentSeason.value);
            loadedFighter.features = await FighterRepository.loadAllFeatures(name, currentSeason.value);
        }
        catch(ex){
            throw ex;
        }

        return loadedFighter;
    }

    static async loadAllAchievements(fighterName:string, season:number):Promise<Achievement[]>{
        let result;

        try{
            result = await Model.db('nsfw_fighters_achievements').select('idAchievement', 'createdAt').where('idFighter', fighterName).andWhere('season', season);
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
            result = await Model.db('nsfw_fighters_features').where('idFighter', fighterName).andWhere('season', season).select();
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

    public static async delete(name:string, season:string):Promise<void>{
        await Model.db('nsfw_fighters').where({name: name, season: season}).del();
    }

}