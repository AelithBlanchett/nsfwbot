var brawl = [];

brawl.push(
    {
        id: 0,
        title: "Punch",
        description: "A solid punch!",
        damageHP: "1",
        requirements: [{strength: 1},{ agility: 1}, {dexterity: 1}]
    });

brawl.push(
    {
        id: 1,
        title: "Kick",
        description: "A swift kick!",
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].toughness", //(User Strength's - Target's Toughness)
        requirements: [{strength: 1},{ agility: 1}, {flexibility : 1}]
    });

brawl.push(
    {
        id: 2,
        title: "Slap",
        description: "A spanking galore!",
        damageHP: "1",
        requirements: [{strength: 1, dexterity: 1}]
    });




// advanced


brawl.push(
    {
        id: 3,
        title: "Lariat",
        description: "A charge forward with an extended arm aimed to knock an opponent off their feet.",
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].toughness",
        requirements: [{strength: 1, dexterity: 1}]
    });

//brawl.push(
//    {
//            id: 3,
//            title: "Impossible attack",
//            description: "For testing purposes",
//            damageHP: "0",
//            requirements: [{strength: 4, agility: 2},{strength: 5, flexibility: 9}]
//    });

module.exports = brawl;