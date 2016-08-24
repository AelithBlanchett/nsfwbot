/// <reference path="./Fight.ts" />
import * as mysql from "mysql";
import {IConnection} from "mysql";
var mySqlConfig = require('../../config/config.mysql.js');
"use strict";

export class BaseModel {
    public static db:IConnection;

    public static initializeDb(_db){
        _db = mysql.createConnection(mySqlConfig); // Recreate the connection, since
        // the old one cannot be reused.

        _db.connect(function(err) {              // The server is either down
            if(err) {                                     // or restarting (takes a while sometimes).
                console.log('error when connecting to db:', err);
                setTimeout(BaseModel.initializeDb(BaseModel.db), 2000); // We introduce a delay before attempting to reconnect,
            }                                     // to avoid a hot loop, and to allow our node script to
        });                                     // process asynchronous requests in the meantime.
                                                // If you're also serving http, display a 503 error.
        _db.on('error', function(err) {
            console.log('db error', err);
            if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                BaseModel.initializeDb(BaseModel.db);                         // lost due to either server restart, or a
            } else {                                      // connnection idle timeout (the wait_timeout
                throw err;                                  // server variable configures this)
            }
        });
    }
}




BaseModel.initializeDb(BaseModel.db);