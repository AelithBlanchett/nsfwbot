import {Fighter} from "../plugins/NSFWClasses/Fighter";
import {Fight} from "../plugins/NSFWClasses/Fight";
//let myFighter = new Fighter("test", 0, 0 ,0 ,0 ,0);

var Jasmine = require('jasmine');
var jasmine = new Jasmine();

/// <reference path="../typings/jasmine/jasmine.d.ts">

describe("Fighter testing", () => {

    //it("should say that it doesn't exist", function(done) {
    //    Fighter.exists("test").then(function(result) {
    //        done();
    //    }).catch(function(err) {
    //        done.fail(err);
    //    });
    //});
    //var fakeFighter = null;
    //
    //beforeEach(function() {
    //    fakeFighter = {
    //        create: function(){
    //        }
    //    };
    //
    //    spyOn(fakeFighter, 'create');
    //});
    //
    //it("should fail as no name was passed", function(){
    //    expect(function(){new Fighter();}).toThrowError();
    //});
    //
    //it("should call create", function(){
    //    var mySpy = spyOn(Fighter.prototype, 'create').and.callFake(function(){console.log("Create called")});
    //    var fightur = new Fighter("test45f");
    //    expect(mySpy).toHaveBeenCalled();
    //});
});

jasmine.execute();

//console.log(myFighter.name);