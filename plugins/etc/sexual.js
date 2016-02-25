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
        lustPenalty: "0", // Used to be 2 but is strike through now
        damageLust: "3",
        conditions: "currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].orgasms >= 1",
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
        lustPenalty: "0", // Used to be 2 but is strike through now
        damageLust: "3",
        conditions: "currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].orgasms >= 1",
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
        // Requirement that target is in hold missing
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
        // Requirement forced fingering / forces cock sucking missing
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
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
        // Requirement forces cock sucking missing
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "True",
        statRequirements: [{endurance: 4}]
    });

sexual.push(
    {
        id: 14,
        title: "Forced Pussy/Ass Worship",
        description: " Use a combination of fingers and tongue to properly propel your opponent to climax!",
        damageLust: 3,
        // Requirement forced fingering / forces licking missing
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
        // Requirement forced fingering missing
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
        statRequirements: [{dexterity: 6}]
    });

sexual.push(
    {
        id: 15,
        title: "Prostate Massage",
        description: "Oh my~♥ ",
        damageLust: 3,
        // Requirement forced fingering missing
        onSuccess: "",
        onSuccessText: "",
        onFailure: "",
        onFailureText: "",
        isHold: "False",
        statRequirements: [{dexterity: 6}]
    });


module.exports = sexual;
