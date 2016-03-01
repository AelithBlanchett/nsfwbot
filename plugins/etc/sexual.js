var sexual = [];

sexual.push(
    {
        id: 999,
        title: "1",
        description: "A place-holder value, while everything isn't setup yet.",
        damageLust: "1",
        statRequirements: []
    });

sexual.push(
    {
        id: 0,
        title: "Final Fucking",
        description: "It's time to penetrate your opponent. Ladies~ Use !sextoys to get the most out of this, newhalfs and gentlemen - we're going in.",
        lustPenalty: "2",
        damageLust: "3",
        conditions: "currentFighters[defender].orgasms >= 1",
        conditionsText: "Opponent must have had at least 1 orgasm",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{strength: 1, agility: 1, endurance: 1}]
    });

sexual.push(
    {
        id: 1,
        title: "Final Ride",
        description: "Claim the cock that is yours! Give that cock a ride it will never forget!",
        lustPenalty: "2",
        damageLust: "3",
        conditions: "currentFighters[defender].orgasms >= 1",
        conditionsText: "Opponent must have had at least 1 orgasm",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{strength: 1, agility: 1, endurance: 1}]
    });

sexual.push(
    {
        id: 2,
        title: "Forced Cock Stroking",
        description: "Wrapping fingers around the cock, sliding them up and down the length~♥",
        damageLust: "1",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{dexterity: 1}]
    });

sexual.push(
    {
        id: 3,
        title: "Forced Cock Sucking",
        description: "Giving your opponent a blowjob against their wil: Mmm~ Cock~♥",
        damageLust: "1",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{endurance: 1}]
    });

sexual.push(
    {
        id: 4,
        title: "Forced Face Fucking",
        description: "Forcing your cock into your opponent's mouth against their will: Suck it bitch~♥",
        damageLust: "1",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{strength: 1, dexterity: 1}]
    });

sexual.push(
    {
        id: 5,
        title: "Forced Fingering",
        description: "I hope you brought lube and didn't just shove 'em in there!",
        damageLust: "1",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{strength: 1, dexterity: 1}]
    });

sexual.push(
    {
        id: 6,
        title: "Forced Kissing",
        description: "Ooo la~la~ Use the tongue",
        damageLust: "1",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
        statRequirements: []
    });

sexual.push(
    {
        id: 7,
        title: "Forced Licking",
        description: "Licking a special spot~ You might even call it a 'tongue fucking'. ",
        damageLust: "1",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: []
    });

sexual.push(
    {
        id: 8,
        title: "Playing with Scissors",
        description: "Pussy v.s. Pussy! Only one shall rule! Other names for this attack included 'Don't run with scissors!'' and 'Terminal Tribbing' ",
        damageLust: "3",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{strength: 1, agility: 1, endurance: 1}]
    });

sexual.push(
    {
        id: 9,
        title: "Slap",
        description: " A spanking galore! ",
        damageLust: "1",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
        statRequirements: [{strength: 1, dexterity: 1}]
    });

sexual.push(
    {
        id: 10,
        title: "Ball-Slapping Face-Fuck",
        description: "That's right all the way to the base, bitch! ",
        damageLust: "2",
        condition: "!isInHold(defender)",
        conditionText: "The target must be in a hold.",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
        statRequirements: [{strength: 4}]
    });

sexual.push(
    {
        id: 11,
        title: "Cock Milking",
        description: "That's right, just let it all out~♥ ",
        damageLust: "3",
        condition: "isInHold(defender) && currentFight.currentHold.type == 'sexual' && (currentFight.currentHold.id == 2 || currentFight.currentHold.id == 5)",
        conditionText: "Opponent must be in either \"Forced Fingering\" or \"Forced Cock Stroking\" to use this move. ",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        bonusRoll: "2", //Increases the Hit Dice of "Prostate Massage" by +2. 
        bonusForAttacks: "sexual:15", // Prostate Massage
        statRequirements: [{strength: 3, dexterity: 5, endurance: 4}]
    });

sexual.push(
    {
        id: 12,
        title: "Deep Throating",
        description: " Starting to go down deep~♥",
        damageLust: 2,
        condition: "isInHold(defender) && currentFight.currentHold.type == 'sexual' && currentFight.currentHold.id == 3",
        conditionText: "Opponent must be in \"Forced Cock Sucking\" to use this move.",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{endurance: 4}]
    });

sexual.push(
    {
        id: 13,
        title: "Double Climax",
        description: " Starting to go down deep~♥",
        damageLust: 1,
        lustPenalty: 1,
        condition: "(currentFight[attacker].lust == parseInt(currentFight[attacker].endurance) - 1) && (currentFight[defender].lust == parseInt(currentFight[defender].endurance) - 1)",
        conditionText: "Opponent must be 1 Lust away from a climax; User must be 1 Lust away from a climax.",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
        statRequirements: [{strength: 1, agility: 1, endurance: 1}]
    });

sexual.push(
    {
        id: 14,
        title: "Forced Pussy/Ass Worship",
        description: " Use a combination of fingers and tongue to properly propel your opponent to climax!",
        damageLust: 3,
        condition: "isInHold(defender) && currentFight.currentHold.type == 'sexual' && (currentFight.currentHold.id == 5 || currentFight.currentHold.id == 7)",
        conditionText: "Opponent must be in \"Forced Cock Sucking\" or \"Forced Licking\" to use this move.",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{strength: 2, dexterity: 2, agility: 2, endurance: 2}]
    });

sexual.push(
    {
        id: 15,
        title: "G-Spot Massage",
        description: "L-Lewd!~♥",
        damageLust: 3,
        condition: "isInHold(defender) && currentFight.currentHold.type == 'sexual' && currentFight.currentHold.id == 5",
        conditionText: "Opponent must be in \"Forced Fingering\" to use this move.",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
        statRequirements: [{dexterity: 6}]
    });

sexual.push(
    {
        id: 16,
        title: "Prostate Massage",
        description: "Oh my~♥ ",
        damageLust: 3,
        condition: "isInHold(defender) && currentFight.currentHold.type == 'sexual' && currentFight.currentHold.id == 5",
        conditionText: "Opponent must be in \"Forced Fingering\" to use this move.",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
        statRequirements: [{dexterity: 6}]
    });

sexual.push(
    {
        id: 17,
        title: "Ruined Climax",
        description: "Aww~ poor baby, did you think you would get to cum?",
        damageLust: 1,
        damageHP: "currentFighter[defender].lust",
        condition: "currentFight[defender].lust == parseInt(currentFight[defender].endurance) - 1", //no sadist feature
        conditionText: "Opponent must be in ! lust point away from orgasm.",
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
        statRequirements: [{strength: 5, agility: 5, endurance: 5}]
    });

module.exports = sexual;
