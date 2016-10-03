import * as mysql from "mysql";
import {IConnection} from "mysql";
"use strict";

export class Data {
    static mydb:IConnection = undefined;

    public static get db(): IConnection{
        return Data.initializeDb(false);
    }

    public static initializeDb(forceReset){
        if(Data.mydb == undefined || forceReset == true){
            Data.mydb  = mysql.createConnection(require('../../config/config.mysql.js')); // Recreate the connection, since
            // the old one cannot be reused.

            Data.mydb .connect(function(err) {              // The server is either down
                if(err) {                                     // or restarting (takes a while sometimes).
                    console.log('error when connecting to db:', err);
                    setTimeout(Data.initializeDb(true), 2000); // We introduce a delay before attempting to reconnect,
                }                                     // to avoid a hot loop, and to allow our node script to
            });                                     // process asynchronous requests in the meantime.
                                                    // If you're also serving http, display a 503 error.
            Data.mydb .on('error', function(err) {
                console.log('db error', err);
                if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                    Data.initializeDb(true);                         // lost due to either server restart, or a
                } else {                                      // connnection idle timeout (the wait_timeout
                    throw err;                                  // server variable configures this)
                }
            });
        }
        return Data.mydb ;
    }
}




//BaseModel.initializeDb(BaseModel.db);