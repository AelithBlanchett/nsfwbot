var brawl = [];


brawl.push(
    {
        id: 999,
        title: "1",
        description: "A place-holder value, while everything isn't setup yet.",
        damageHP: "1",
        statRequirements: []
    });

brawl.push(
    {
        id: 0,
        title: "Punch",
        description: "A solid punch!",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness",
        statRequirements: [{strength: 1}, {dexterity: 1}]
    });

brawl.push(
    {
        id: 22,
        title: "Open Palm Strike",
        description: "It's like a forceful shove but more karate!",
        damageHP: "currentFighters[attacker].dexterity - currentFighters[defender].toughness",
        statRequirements: [{strength: 1}, {dexterity: 1}]
    });

brawl.push(
    {
        id: 1,
        title: "Kick",
        description: "A swift kick!",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].toughness", //(User Strength's - Target's Toughness)
        onFailure: "currentFighters[defender].dice.addTmpMod(1)",
        statRequirements: [{strength: 1}, {agility: 1}, {flexibility: 1}]
    });

brawl.push(
    {
        id: 2,
        title: "Spank",
        description: "A spanking galore!",
        damageHP: "2",
        statRequirements: [{dexterity: 2}]
    });


// advanced

// Aerial Maneuvers

brawl.push(
    {
        id: 3,
        title: "Arm-Twist Rope walk Chop",
        description: "The wrestler takes hold of one of the opponent's wrists and twists that arm in an arm wrench. The wrestler then climbs up the corner turnbuckles and walks on the top rope, before jumping down and striking the opponent's chest, back or the back of their neck.",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].flexibility",
        onFailure: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{agility: 3, dexterity: 3}]
    });

brawl.push(
    {
        id: 4,
        title: "Diamond Dust",
        description: "This move involves the attacking wrestler standing on a platform (i.e. the second turnbuckle, or sitting on the top turnbuckle) and facing the back of a standing opponent while applying an inverted facelock. From this position the attacking wrestler leaps forward, somersaulting, to roll the inverted facelock into a three-quarter facelock, as they fall the wrestler drops to a seated position and driving the opponent's jaw into their shoulder for a jawbreaker, or, the wrestler falls back-first forcing the opponent's face into the mat/shoulder for the bulldog.",
        damageHP: "(2*currentFighters[attacker].agility) - currentFighters[defender].toughness",
        onFailure: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{agility: 6, dexterity: 2}]
    });

brawl.push(
    {
        id: 5,
        title: "Diving Elbow Drop",
        description: "A diving elbow drop is executed by diving onto a supine opponent with one's elbow cocked, driving the elbow into the opponent's shoulder, chest, or head.",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].toughness",
        onFailure: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{agility: 4, dexterity: 4}]
    });

brawl.push(
    {
        id: 5,
        title: "Diving Stomp",
        description: "A diving elbow drop is executed by diving onto a supine opponent with one's elbow cocked, driving the elbow into the opponent's shoulder, chest, or head.",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].toughness",
        onFailure: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{agility: 5}]
    });

brawl.push(
    {
        id: 6,
        title: "Mushroom Stomp ",
        description: "While situated on the middle rope of a turnbuckle, a wrestler jumps over a charging opponent and drives his feet into the opponent's back in order to push him into the turnbuckle or the ground with greater force, before landing on his feet.",
        damageHP: "(2*currentFighters[attacker].agility) - currentFighters[defender].toughness",
        onFailure: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{agility: 5}]
    });



// Martial Arts


brawl.push(
    {
        id: 7,
        title: "Spinning Back Kick",
        description: "This move usually involves the wrestler spinning 360 degrees, before hitting their opponent with back of his/her leg(s) or heel(s) on the face, neck or chest. One variant of this involves the wrestler jumping as they spin so that his or her body is somewhat horizontal for greater impact.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness",
        statRequirements: [{strength: 3, agility: 4}]
    });

brawl.push(
    {
        id: 8,
        title: "Flying Spinning Back Kick",
        description: "A move in which the wrestler will jump from an elevated position (usually the top turnbuckle) and strike a standing opponent with spinning heel kick in mid-air.",
        damageHP: "(currentFighters[attacker].agility > currentFighters[defender].agility ? (currentFighters[attacker].strength - currentFighters[defender].toughness) : (2*currentFighters[attacker].strength - currentFighters[defender].toughness))",
        onFailure: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{strength: 4, agility: 6}]
    });

// Wrestling Staples


brawl.push(
    {
        id: 9,
        title: "Lariat",
        description: "A charge forward with an extended arm aimed to knock an opponent off their feet.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness",
        statRequirements: [{strength: 1, dexterity: 1}]
    });

brawl.push(
    {
        id: 10,
        title: "Bulldog",
        description: "A bulldog is a move in which the wrestler applies a headlock or face lock to his opponent and leaps forward, so that the wrestler lands on his back or in a sitting position, driving the opponent’s face into the mat.",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].toughness",
        statRequirements: [{dexterity: 2, agility: 2}]
    });

brawl.push(
    {
        id: 11,
        title: "Diving Bulldog",
        description: "A bulldog performed from an elevated position to increase the damage done to both wrestlers from the fall.",
        damageHP: "(2*currentFighters[attacker].agility) - currentFighters[defender].toughness",
        hpPenalty: "3",
        statRequirements: [{dexterity: 3, agility: 7}]
    });

brawl.push(
    {
        id: 13,
        title: "Springboard Bulldog",
        description: "While applying a facelock, the wrestler springboards off of the bottom rope, leaping into the air to come crashing down onto the mat with the opponent.",
        damageHP: "(2*currentFighters[attacker].agility) - currentFighters[defender].toughness",
        hpPenalty: "3",
        onFailure: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{dexterity: 4, agility: 6}]
    });

brawl.push(
    {
        id: 14,
        title: "Cross Body",
        description: "This is a maneuver in which a wrestler jumps onto his opponent and lands horizontally across the opponent's torso, forcing them to the mat.",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].toughness",
        statRequirements: [{toughness: 2, agility: 2}]
    });

brawl.push(
    {
            id: 15,
            title: "Knife Edge Chop",
            description: "A swift chop with the edge of the palm!",
            damageHP: "currentFighters[attacker].dexterity - currentFighters[defender].toughness",
            bonusRoll: "1",
            bonusForAttacks: "brawl:all",
            statRequirements: [{strength: 1, dexterity: 3}]
    });

brawl.push(
    {
            id: 16,
            title: "Pressure Point Penetration",
            description: "A vicious poke in a sensitive spot to prepare the body for pain or pleasure.",
            damageHP: "1",
            bonusRoll: "1",
            bonusForAttacks: "brawl:all",
            statRequirements: [{dexterity: 4}]
    });

brawl.push(
    {
        id: 17,
        title: "Senton Bomb",
        description: "The attacking wrestler executes a quick front somersault off the top turnbuckle, before landing on the opponent back-first. It can also be performed from a standing position.",
        damageHP: "(3*currentFighters[attacker].agility) - currentFighters[defender].toughness",
        hpPenalty: "currentFighters[defender].toughness",
        onFailure: "currentFighters[attacker].hp -= currentFighters[attacker].agility",
        onFailureText: "That miss has apparently hurt quite much!",
        statRequirements: [{toughness: 4, agility: 8}]
    });

brawl.push(
    {
        id: 18,
        title: "Drop Kick",
        description: "A swift kick.",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].toughness",
        onFailure: "currentFighters[defender].dice.addTmpMod(2)",
        onFailureText: "That miss has given the defender a small advantage!",
        statRequirements: [{strength: 3, agility: 3}]
    });

/// Throws

brawl.push(
    {
        id: 19,
        title: "Choke Slam",
        description: "A chokeslam is any body slam in which the wrestler grasps his/her opponent's neck, lifts him/her up, and slams him/her to the mat, causing him/her to land on his/her back.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].toughness",
        onSuccess: "currentFighters[defender].dice.addTmpMod(-1); if(holdInPlace()){releaseHold();}",
        onSuccessText: "What a slam! The defender looks exhausted!",
        onFailure: "if(holdInPlace()){releaseHold();}",
        onFailureText: "The slam didn't hit, but the defender is now out of the hold!",
        statRequirements: [{strength: 8, dexterity: 3}]
    });

brawl.push(
    {
        id: 20,
        title: "Headscissors Takedown",
        description: "A chokeslam is any body slam in which the wrestler grasps his/her opponent's neck, lifts him/her up, and slams him/her to the mat, causing him/her to land on his/her back.",
        damageHP: "currentFighters[attacker].agility * 2 - currentFighters[defender].toughness",
        onSuccess: "currentFighters[defender].dice.addTmpMod(-2); if(holdInPlace()){releaseHold();}",
        onSuccessText: "What a takedown! The defender looks exhausted, but they're not blocked in the hold anymore!",
        onFailure: "if(holdInPlace()){releaseHold();}",
        onFailureText: "The takedown didn't hit, but the defender is now out of the hold!",
        statRequirements: [{strength: 4, dexterity: 7}]
    });

brawl.push(
    {
        id: 21,
        title: "Tiger Suplex",
        description: "",
        conditions: "isInHold(defender) && currentFight.currentHold != null && currentFight.currentHold.type == 'holds' && currentFight.currentHold.aliasId == 7",
        conditionsText: "Opponent must be in the Double Chicken Wing hold.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].toughness",
        statRequirements: [{strength: 6, dexterity: 4, agility: 4, flexibility: 4}]
    });

module.exports = brawl;