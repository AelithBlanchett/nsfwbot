"use strict";
var fChatLibInstance;
var didYouMean = require('didyoumean');
var Dice = require('Dice.ts');

module.exports = function (parent) {
    fChatLibInstance = parent;
    var cmdHandler = {};

    return cmdHandler;
};