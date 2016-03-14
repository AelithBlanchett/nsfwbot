var classes = [];

classes.push(
    {
        id: 0,
        title: "Brawler",
        stats: {strength: 7, toughness: 4, dexterity: 2, agility: 3, flexibility: 1, endurance: 3}
    });
classes.push(
    {
        id: 1,
        title: "Acrobat",
        stats: {strength: 1, toughness: 4, dexterity: 3, agility: 8, flexibility: 1, endurance: 3}
    });

//classes.push(
//    {
//        id: 2,
//        title: "Submission Specialist",
//        stats: {strength: 4, toughness: 2, dexterity: 4, agility: 4, flexibility: 4, endurance: 2}
//    });

classes.push(
    {
        id: 3,
        title: "Sex Fiend",
        stats: {strength: 4, toughness: 3, dexterity: 6, agility: 2, flexibility: 1, endurance: 4},
        feature: 5
    });


module.exports = classes;