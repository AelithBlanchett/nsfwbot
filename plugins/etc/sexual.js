var sexual = [];

sexual.push(
    {
        id: 0,
        title: "1",
        description: "A place-holder value, while everything isn't setup yet.",
        damageLust: "1",
        statRequirements: []
    });

sexual.push(
    {
        id: 0,
        title: "Final Fucking",
        description: "A solid punch!",
        lustPenalty: "2",
        damageLust: "3",
        conditions: "currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].orgasms >= 1",
        conditionsText: "Opponent must have had at least 1 orgasm",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        statRequirements: [{strength: 1, agility: 1, endurance: 1}]
    });

sexual.push(
    {
        id: 1,
        title: "Forced Cock Stroking",
        description: "A solid punch!",
        damageLust: "1",
        statRequirements: [{dexterity: 1}]
    });

sexual.push(
    {
        id: 2,
        title: "Forced Cock Sucking",
        description: "A solid punch!",
        damageLust: "1",
        statRequirements: [{endurance: 1}]
    });

sexual.push(
    {
        id: 3,
        title: "Forced Face Fucking",
        description: "A solid punch!",
        damageLust: "1",
        statRequirements: [{strength: 1, dexterity: 1}]
    });

sexual.push(
    {
        id: 4,
        title: "Forced Fingering",
        description: "A solid punch!",
        damageLust: "1",
        statRequirements: [{strength: 1, dexterity: 1}]
    });

sexual.push(
    {
        id: 5,
        title: "Forced Kissing",
        description: "A solid punch!",
        damageLust: "1",
        statRequirements: []
    });

sexual.push(
    {
        id: 2,
        title: "Forced Licking",
        description: "A solid punch!",
        damageLust: "1",
        statRequirements: []
    });

sexual.push(
    {
        id: 2,
        title: "Forced Pussy Worship",
        description: "A solid punch!",
        damageLust: "1",
        statRequirements: [{strength: 1, agility: 1, endurance: 1}]
    });

sexual.push(
    {
        id: 2,
        title: "Forced Ass Worship",
        description: "A solid punch!",
        damageLust: "1",
        statRequirements: [{strength: 1, agility: 1, endurance: 1}]
    });

sexual.push(
    {
        id: 2,
        title: "Slap",
        description: "A solid punch!",
        damageLust: "1",
        statRequirements: [{strength: 1, dexterity: 1}]
    });

sexual.push(
    {
        id: 2,
        title: "Ball-Slapping Face-Fuck",
        description: "A solid punch!",
        damageLust: "2",
        statRequirements: [{strength: 4, dexterity: 1}]
    });

sexual.push(
    {
        id: 2,
        title: "Deep Throating",
        description: "A solid punch!",
        damageLust: "2",
        statRequirements: [{endurance: 4}]
    });

sexual.push(
    {
        id: 2,
        title: "Double Climax",
        description: "A solid punch!",
        damageLust: 0,
        statRequirements: [{strength: 1, dexterity: 1}]
    });

sexual.push(
    {
        id: 2,
        title: "Prostate Massage",
        description: "A solid punch!",
        damageLust: "3",
        statRequirements: [{dexterity: 6}]
    });

sexual.push(
    {
        id: 2,
        title: "Ruined Climax",
        description: "A solid punch!",
        damageLust: 0,
        statRequirements: [{strength: 1, dexterity: 1}]
    });

module.exports = sexual;