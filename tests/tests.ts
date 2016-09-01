import {Fighter} from "../plugins/NSFWClasses/Fighter";
import {Fight} from "../plugins/NSFWClasses/Fight";
import {IFChatLib} from "../plugins/NSFWClasses/interfaces/IFChatLib";
import {CommandHandler} from "../plugins/NSFWClasses/CommandHandler";
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
        x.join("Purple", {character: "test1", channel: "here"});
        setTimeout(function(){x.ready("", {character: "test1", channel: "here"})}, 2000);
        x.join("Purple", {character: "test2", channel: "here"});
        setTimeout(function(){x.ready("", {character: "test2", channel: "here"})}, 2000);
        x.join("Purple", {character: "test3", channel: "here"});
        setTimeout(function(){x.ready("", {character: "test3", channel: "here"})}, 2000);
        x.join("Yellow", {character: "test4", channel: "here"});
        setTimeout(function(){x.ready("", {character: "test4", channel: "here"})}, 2000);
        x.join("Yellow", {character: "test5", channel: "here"});
        setTimeout(function(){x.ready("", {character: "test5", channel: "here"})}, 2000);
        x.join("Yellow", {character: "test6", channel: "here"});
        setTimeout(function(){x.ready("", {character: "test6", channel: "here"})}, 2000);


        setTimeout(_ =>{
            for(let i = 1; i < 10; i++){
                setTimeout(_ =>{
                    x.fight.nextTurn();
                }, i*1000);
            }
        }, 6000);
        setTimeout(done, 100000);
    },1000000);

});

jasmine.execute();

//console.log(myFighter.name);