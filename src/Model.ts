import * as mysql from "mysql";
import {IConnection} from "mysql";
"use strict";

export abstract class Model {
    static mydb:IConnection = undefined;

    public static get db(): IConnection{
        return Model.initializeDb(false);
    }

    public static initializeDb(forceReset){
        if(Model.mydb == undefined || forceReset == true){
            Model.mydb  = mysql.createConnection(require('../config/config.mysql.js')); // Recreate the connection, since
            // the old one cannot be reused.

            Model.mydb .connect(function(err) {              // The server is either down
                if(err) {                                     // or restarting (takes a while sometimes).
                    console.log('error when connecting to db:', err);
                    setTimeout(Model.initializeDb(true), 2000); // We introduce a delay before attempting to reconnect,
                }                                     // to avoid a hot loop, and to allow our node script to
            });                                     // process asynchronous requests in the meantime.
                                                    // If you're also serving http, display a 503 error.
            Model.mydb .on('error', function(err) {
                console.log('db error', err);
                if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                    Model.initializeDb(true);                         // lost due to either server restart, or a
                } else {                                      // connnection idle timeout (the wait_timeout
                    throw err;                                  // server variable configures this)
                }
            });
        }
        return Model.mydb ;
    }

}