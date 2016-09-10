import {Fighter} from "../plugins/NSFWClasses/Fighter";
import {Fight} from "../plugins/NSFWClasses/Fight";
import {IFChatLib} from "../plugins/NSFWClasses/interfaces/IFChatLib";
import {CommandHandler} from "../plugins/NSFWClasses/CommandHandler";
import {Constants} from "../plugins/NSFWClasses/Constants";
import Tier = Constants.Tier;
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

    it("should start the match", function(done){
        var x = new CommandHandler(fChatLibInstance, "here");
        //let y = x.fight.getTeamsList();
        //let z = x.fight.getTeamsIdList();
        x.join("Red", {character: "Aelith Blanchette", channel: "here"});
        x.join("Purple", {character: "Purple1", channel: "here"});
        x.join("Purple", {character: "Purple2", channel: "here"});
        x.join("Red", {character: "TheTinaArmstrong", channel: "here"});
        setTimeout(function(){x.ready("", {character: "Aelith Blanchette", channel: "here"})}, 1000);
        setTimeout(function(){x.ready("", {character: "Purple1", channel: "here"})}, 1500);
        setTimeout(function(){x.ready("", {character: "Purple2", channel: "here"})}, 2000);
        setTimeout(function(){x.ready("", {character: "TheTinaArmstrong", channel: "here"})}, 2500);
        //x.join("Purple", {character: "Purple1", channel: "here"});
        //setTimeout(function(){x.ready("", {character: "Purple1", channel: "here"})}, 2000);
        //x.join("Purple", {character: "Purple2", channel: "here"});
        //setTimeout(function(){x.ready("", {character: "Purple2", channel: "here"})}, 2000);
        //x.join("Purple", {character: "Purple3", channel: "here"});
        //setTimeout(function(){x.ready("", {character: "Purple3", channel: "here"})}, 2000);
        //x.join("Yellow", {character: "Yellow1", channel: "here"});
        //setTimeout(function(){x.ready("", {character: "Yellow1", channel: "here"})}, 2000);
        //x.join("Yellow", {character: "Yellow2", channel: "here"});
        //setTimeout(function(){x.ready("", {character: "Yellow2", channel: "here"})}, 2000);
        //x.join("Yellow", {character: "Yellow3", channel: "here"});
        //setTimeout(function(){x.ready("", {character: "Yellow3", channel: "here"})}, 2000);


        setTimeout(_ =>{
            for(let i = 1; i <= 100; i++){
                setTimeout(_ =>{
                    x.fight.doAction(x.fight.currentPlayer.id, "brawl", Tier.Light);
                }, i*500);
            }
        }, 6000);

        setTimeout(_ =>{
            x.fight.saveState();
        }, 8000);
        setTimeout(done, 10000000);
    },100000000);



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