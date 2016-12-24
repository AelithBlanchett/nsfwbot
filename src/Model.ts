import Knex = require("knex");
import {config} from "../config/config.mysql"

export abstract class Model {
    static _db:Knex = null;

    public static get db(): Knex{
        if(Model._db == null){
            Model._db = Knex({
                client: 'mysql',
                connection: config
            });
        }

        return Model._db;
    }

}