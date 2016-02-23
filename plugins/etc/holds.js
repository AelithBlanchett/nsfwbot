var holds = [];

holds.push(
    {
        id: 0,
        title: "Arm Bar",
        description: "The wrestler takes hold of the opponent's arm and twists it, putting pressure on the shoulder and elbow.",
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, agility: 3}]
    });

module.exports = holds;