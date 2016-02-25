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
        damageHP: "1",
        statRequirements: [{strength: 1}, {agility: 1}, {dexterity: 1}]
    });

brawl.push(
    {
        id: 1,
        title: "Kick",
        description: "A swift kick!",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User Strength's - Target's Toughness)
        onMiss: "currentFighters[defender].dice.addTmpMod(1)",
        statRequirements: [{strength: 1}, {agility: 1}, {flexibility: 1}]
    });

brawl.push(
    {
        id: 2,
        title: "Slap",
        description: "A spanking galore!",
        damageHP: "1",
        statRequirements: [{strength: 1, dexterity: 1}]
    });


// advanced

// Aerial Maneuvers

brawl.push(
    {
        id: 3,
        title: "Arm-Twist Rope walk Chop",
        description: "The wrestler takes hold of one of the opponent's wrists and twists that arm in an arm wrench. The wrestler then climbs up the corner turnbuckles and walks on the top rope, before jumping down and striking the opponent's chest, back or the back of their neck.",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].flexibility",
        onMiss: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{agility: 3, dexterity: 3}]
    });

brawl.push(
    {
        id: 4,
        title: "Diamond Dust",
        description: "This move involves the attacking wrestler standing on a platform (i.e. the second turnbuckle, or sitting on the top turnbuckle) and facing the back of a standing opponent while applying an inverted facelock. From this position the attacking wrestler leaps forward, somersaulting, to roll the inverted facelock into a three-quarter facelock, as they fall the wrestler drops to a seated position and driving the opponent's jaw into their shoulder for a jawbreaker, or, the wrestler falls back-first forcing the opponent's face into the mat/shoulder for the bulldog.",
        damageHP: "(2*currentFighters[attacker].agility) - currentFighters[defender].toughness",
        onMiss: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{agility: 6, dexterity: 2}]
    });

brawl.push(
    {
        id: 5,
        title: "Diving Elbow Drop",
        description: "A diving elbow drop is executed by diving onto a supine opponent with one's elbow cocked, driving the elbow into the opponent's shoulder, chest, or head.",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].toughness",
        onMiss: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{agility: 4, dexterity: 4}]
    });

brawl.push(
    {
        id: 5,
        title: "Diving Stomp",
        description: "A diving elbow drop is executed by diving onto a supine opponent with one's elbow cocked, driving the elbow into the opponent's shoulder, chest, or head.",
        damageHP: "currentFighters[attacker].agility - currentFighters[defender].toughness",
        onMiss: "currentFighters[attacker].dice.addTmpMod(-1)",
        statRequirements: [{agility: 5}]
    });

brawl.push(
    {
        id: 6,
        title: "Mushroom Stomp ",
        description: "While situated on the middle rope of a turnbuckle, a wrestler jumps over a charging opponent and drives his feet into the opponent's back in order to push him into the turnbuckle or the ground with greater force, before landing on his feet.",
        damageHP: "(2*currentFighters[attacker].agility) - currentFighters[defender].toughness",
        onMiss: "currentFighters[attacker].dice.addTmpMod(-1)",
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
        onMiss: "currentFighters[attacker].dice.addTmpMod(-1)",
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
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness",
        statRequirements: [{dexterity: 2, agility: 2}]
    });

brawl.push(
    {
        id: 11,
        title: "Diving Bulldog",
        description: "A bulldog performed from an elevated position to increase the damage done to both wrestlers from the fall.",
        damageHP: "(2*currentFighters[attacker].agility) - currentFighters[defender].toughness",
        statRequirements: [{dexterity: 3, agility: 4}]
    });

brawl.push(
    {
        id: 13,
        title: "Springboard Bulldog",
        description: "While applying a facelock, the wrestler springboards off of the bottom rope, leaping into the air to come crashing down onto the mat with the opponent.",
        damageHP: "(2*currentFighters[attacker].agility) - currentFighters[defender].toughness",
        onMiss: "currentFighters[attacker].dice.addTmpMod(-1)",
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

module.exports = brawl;