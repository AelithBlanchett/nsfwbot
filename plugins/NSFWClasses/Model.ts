import * as mysql from "mysql";
import {IConnection} from "mysql";
import {getConnectionManager} from "typeorm";
import {Connection} from "typeorm/index";

export class Data {
    static mydb:Connection = undefined;

    static async getDb():Promise<Connection> {
        if (!getConnectionManager().has("default")) {
            return await getConnectionManager().createAndConnect(require('../../config/config.mysql.js'));
        }
        return getConnectionManager().get("default");
    }
}




//BaseModel.initializeDb(BaseModel.db);