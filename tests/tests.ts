import {Fighter} from "../plugins/NSFWClasses/Fighter";
import {Fight} from "../plugins/NSFWClasses/Fight";
import {IFChatLib} from "../plugins/NSFWClasses/interfaces/IFChatLib";
import {CommandHandler} from "../plugins/NSFWClasses/CommandHandler";
import {Constants} from "../plugins/NSFWClasses/Constants";
import Tier = Constants.Tier;
var waitUntil = require('wait-until');
//let myFighter = new Fighter("test", 0, 0 ,0 ,0 ,0);

var Jasmine = require('jasmine');
var jasmine = new Jasmine();

/// <reference path="../typings/jasmine/jasmine.d.ts">

describe("Fighter testing", () => {
    var fChatLibInstance: IFChatLib;

    beforeEach(function() {
        fChatLibInstance = {
            sendMessage: function(message:string, channel:string){
                console.log("Sent MESSAGE "+message + " on channel "+channel);
            },
            throwError: function(s: string){
                console.log("Sent ERROR "+s);
            },
            sendPrivMessage: function(character: string, message: string){
                console.log("Sent PRIVMESSAGE "+message + " to "+character);
            }
        };
    });

    //it("should join ring", function(done){
    //    var x = new CommandHandler(fChatLibInstance, "here");
    //    var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
    //    x.join("", data);
    //    setTimeout(done, 1000);
    //});
    //
    //it("should not join ring", function(done){
    //    var x = new CommandHandler(fChatLibInstance, "here");
    //    var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
    //    x.join("", data);
    //    x.join("", data);
    //    setTimeout(done, 1000);
    //});
    //
    //it("should join ring and set ready", function(done){
    //    var x = new CommandHandler(fChatLibInstance, "here");
    //    var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
    //    x.ready("", data);
    //    setTimeout(done, 1000);
    //});
    //
    //it("should say already joined ring and set ready", function(done){
    //    var x = new CommandHandler(fChatLibInstance, "here");
    //    var data:FChatResponse = {character: "Aelith Blanchette", channel: "here"};
    //    x.ready("", data);
    //    x.ready("", data);
    //    setTimeout(done, 1000);
    //});

    function initiateMatchSettings(cmdHandler){
        let pro = new Promise((resolve, reject) => {
            cmdHandler.fight.setFightType("tagteam");
            resolve();
        }).then(() => {
            cmdHandler.join("Red", {character: "Aelith Blanchette", channel: "here"});
        }).then(() => {
            cmdHandler.join("Purple", {character: "Purple1", channel: "here"});
        }).then(() => {
            cmdHandler.join("Purple", {character: "Purple2", channel: "here"});
        }).then(() => {
            cmdHandler.join("Red", {character: "TheTinaArmstrong", channel: "here"});
        }).then(() => {
            cmdHandler.ready("Red", {character: "TheTinaArmstrong", channel: "here"});
        }).then(() => {
            cmdHandler.ready("Red", {character: "Aelith Blanchette", channel: "here"});
        }).then(() => {
            cmdHandler.ready("Red", {character: "Purple1", channel: "here"});
        }).then(() => {
            cmdHandler.ready("Red", {character: "Purple2", channel: "here"});
        });
    }

    it("should start the match", function(done){
        var cmd = new CommandHandler(fChatLibInstance, "here");
        initiateMatchSettings(cmd);
        waitUntil().interval(2).times(500).condition(() => { return cmd.fight.fighterList.findIndex(x => x.name == "TheTinaArmstrong") != -1; }).done(() =>{
            cmd.fight.fighterList.getFighterByName("TheTinaArmstrong").dice.addMod(50);
            waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.hasStarted && cmd.fight.waitingForAction);}).done(() =>{
                cmd.tag("Aelith Blanchette", {character: "TheTinaArmstrong", channel: "here"});
                waitUntil().interval(100).times(50).condition(() => {return (cmd.fight.currentPlayer.name != "Aelith Blanchette");}).done(() =>{
                    done();
        });
        });
        });
    },10000);



    //it("should load the first fight and do a move", function(done){
    //    var x = new CommandHandler(fChatLibInstance, "here");
    //    x.fight.loadState(1);
    //
    //    setTimeout(_ =>{
    //        for(let i = 1; i <= 1; i++){
    //            setTimeout(_ =>{
    //                x.fight.doAction(x.fight.currentPlayer.id, "brawl", Tier.Light);
    //            }, i*1000);
    //        }
    //    }, 6000);
    //
    //    //setTimeout(_ =>{
    //    //    x.fight.saveState();
    //    //}, 8000);
    //    setTimeout(done, 10000000);
    //},100000000);

});

jasmine.execute();

//console.log(myFighter.name);