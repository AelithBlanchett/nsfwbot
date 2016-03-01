var holds = [];

//stanceRequirements and holdType not set to final values yet!

// maxTurns: "10", means it has no max turns, dirty workaround

// Some special attacks as still lacking bonus attack ids Marked with an @INCOMPLETE comment

holds.push(
    {
        id: 0,
        title: "Arm Bar",
        description: "The wrestler takes hold of the opponent's arm and twists it, putting pressure on the shoulder and elbow.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, agility: 3}]
    });

holds.push(
    {
        id: 1,
        title: "Cross Arm Bar",
        description: "The wrestler sits on either side of an opponent who is lying either prone or supine on the mat, with the wrestler's legs scissoring one of the opponent's arms. The wrestler then grabs hold of the wrist of that arm and pulls it upwards, causing hyper extension of the shoulder and elbow.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, agility: 3}]
    });

holds.push(
    {
        id: 2,
        title: "Flying Cross Arm Bar",
        description: "This variation begins with the wrestler standing on either side of the opponent. The wrestler then steps over one of the opponent's arms while holding that arm's wrist and then rolls or twists his body in mid-air while holding the wrist, forcing the opponent down to his back and ending in a cross arm bar.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 5, agility: 7}]
    });

holds.push(
    {
        id: 3,
        title: "Arm Wrench",
        description: "The wrestler takes hold of the opponent's arm or wrist and turns around completely while twisting the arm over the wrestler's head, resulting in the opponent's arm being wrenched.",
        damageHP: "0", //(0 Bonus on follow ups)
        bonusRoll: "1",
        bonusForAttacks: "holds:1, brawl:3", // Arm Bar, Arm-Twist Rope walk chop, Fireman's Carry, Irish Whip, Lariat @INCOMPLETE
        holdType: "special",
        maxTurns: "10",
        stanceRequirements: "supine",
        statRequirements: [{strength: 1, dexterity: 2, agility: 2}]
    });

holds.push(
    {
        id: 3,
        title: "Barely Legal",
        description: "From behind a seated opponent, the wrestler grabs one of the opponent's elbows and pulls it up and backward toward himself. He then bends the wrist and forces the open palm of the opponent's hand into his chest, putting pressure on the wrist.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 3, dexterity: 4}]
    });

holds.push(
    {
        id: 4,
        title: "Chicken Wing",
        description: "The wrestler grabs their opponent's arm, pulling it around behind the opponent's back. This stretches the pectorals and shoulder joint, and immobilizes the arm.",
        damageHP: "1", //( Does 1 Health Damage regardless of Strength and Toughness stats. )
        holdType: "strength",
        maxTurns: "10",
        stanceRequirements: "supine",
        statRequirements: [{strength: 2, dexterity: 2, agility: 2}]
    });

holds.push(
    {
        id: 5,
        title: "Bridging Chicken Wing",
        description: "The wrestler approaches a prone opponent facing down, lying down on his stomach. The wrestler grabs any of the opponent's arms, and pulls it to his back (this would result the arm to be bent behind the opponent's back). The wrestler then rolls or flips forward into a bridge, applying pressure on the wrist and elbow.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 2, agility: 2}]
    });

holds.push(
    {
        id: 6,
        title: "Cross-Face Chicken Wing",
        description: "The wrestler approaches a prone opponent facing down, lying down on his stomach. The wrestler grabs any of the opponent's arms, and pulls it to his back (this would result the arm to be bent behind the opponent's back). The wrestler then rolls or flips forward into a bridge, applying pressure on the wrist and elbow.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 3, agility: 3}]
    });

holds.push(
    {
        id: 7,
        title: "Double Chicken Wing ",
        description: "This hold sees the wrestler standing behind the opponent facing the same direction, and then hooking both the opponent's arms under his armpits. ",
        damageHP: "2", // Does 2 Health Damage regardless of Strength and Toughness stats.
        bonusRoll: "4",
        bonusForAttacks: " ", // enables use of Tiger Suplex, giving the attack a +4 to Hit. @INCOMPLETE
        holdType: "strength",
        maxTurns: "10",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 4, agility: 4}]
    });

holds.push(
    {
        id: 8,
        title: "Double Bridging Chicken Wing",
        description: "The wrestler approaches a prone opponent facing down, lying on his stomach. The wrestler then stands over his back, tucks the opponent's arms under his armpits. From this point, the wrestler then rolls or flips into a bridge, pulling the opponent's arms and applying pressure on them.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, dexterity: 3, agility: 3}]
    });

holds.push(
    {
        id: 9,
        title: "Crucifix Double Arm Bar",
        description: "The wrestler holds an opponent's arm with his arms, pulling the arm across his chest. He is situated perpendicular to and behind the opponent. The wrestler then holds the other arm with his legs, stretching the shoulders back in a crucifying position and hyper extending the arms.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, agility: 2}]
    });

holds.push(
    {
        id: 10,
        title: "Figure Four Arm Lock",
        description: "This arm lock sees the wrestler grappling the opponent's wrist with his similar hand (for example, if he uses the right arm, he would grab the opponent's right wrist), and with the opponent's wrist still clutched, the wrestler bend the opponent's arm (of the grappled wrist) it towards or behind the opponent's head (both variations are possible). Then, the wrestler passes his other free arm through the 'hole' formed by the opponent's bent arm under the biceps, and then catches the opponent's grappled wrist. This would result in the opponent's arm to be shaped into a 4. As the opponent's wrist is grabbed by both opponent's hands, along with the bent arm, this applies effective pressure into the opponent.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 3}]
    });

holds.push(
    {
        id: 11,
        title: "Kimura Lock",
        description: "This arm lock sees the wrestler grappling the opponent's wrist with his similar hand (for example, if he uses the right arm, he would grab the opponent's right wrist), and with the opponent's wrist still clutched, the wrestler bend the opponent's arm (of the grappled wrist) it towards or behind the opponent's head (both variations are possible). Then, the wrestler passes his other free arm through the 'hole' formed by the opponent's bent arm under the biceps, and then catches the opponent's grappled wrist. This would result in the opponent's arm to be shaped into a 4. As the opponent's wrist is grabbed by both opponent's hands, along with the bent arm, this applies effective pressure into the opponent.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].toughness", //(User's Strength * 2  - Target's toughness)
        // If the user's Flexibility is 4 or greater then they may also apply a "Body Scissors" hold with a +2 to Hit Dice the turn after this technique is used. 
        // The if Flex > 4 check is not implemented yet 
        bonusRoll: "4",
        bonusForAttacks: " ", // @INCOMPLETE
        holdType: "strength",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, dexterity: 4, agility: 4}]
    });

holds.push(
    {
        id: 12,
        title: "Scissors Arm Bar",
        description: "The wrestler approaches a prone, face down opponent from the side. The wrestler then \"scissors\" (clasps) the near arm of the opponent with their legs and takes hold of the far arm of the opponent with both hands, forcing the opponent onto their side and placing stress on both shoulder joints, as well as making it harder for the opponent to breathe. It can cause serious injury to your opponent if held for long.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 3}]
    });

holds.push(
    {
        id: 13,
        title: "Step-over Arm Lock",
        description: "The standing attacking wrestler grabs the wrist of a face down opponent, pulling it towards themselves, the attacker then steps over the opponents outstretched arm placing one leg either side. From this point, the wrestler would turn 360 degrees, simultaneously bending the arm of the opponent around the attacker's own leg. The wrestler can over-rotate or turn again to apply more pressure on the arm.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 3, dexterity: 4, agility: 4}]
    });

holds.push(
    {
        id: 14,
        title: "Wrist Lock",
        description: "the wrestler grasps the opponent's hand and twists backwards, placing pressure on the wrist. While this can inflict pain on its own, it is most often used as a transition hold. ",
        damageHP: "0", // Special Attack
        bonusRoll: "2",
        bonusForAttacks: "holds:1, holds:2, holds:3, holds:4, holds:5, holds:6, holds:7, holds:8, holds:9, holds:10, holds:11, holds:12, holds:13 ,holds:14", // ALL Arm Lock holds
        holdType: "special",
        maxTurns: "10",
        stanceRequirements: "supine",
        statRequirements: [{strength: 2, dexterity: 2}]
    });


//////////////////////////////////////
// BODY LOCKS
//////////////////////////////////////

holds.push(
    {
        id: 15,
        title: "Back-to-back Back-breaker",
        description: "The wrestler, while behind the opponent, facing away from him in the opposing direction, hooks his arms under the opponent's. From this position, the wrestler lifts the opponent up, usually by bending.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's flexibility)
        bonusRoll: "2", // Increases Hit dice of the Grapple: Throw techniques Neck Breaker and Face Buster by +2 
        bonusForAttacks: "", // @INCOMPLETE
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 8}]
    });

holds.push(
    {
        id: 16,
        title: "Bear Hug",
        description: "A wrestler stands in front of an opponent and locks his hands around the opponent, squeezing him. Often he will shake his body from side to side, in order to generate more pain around the ribs and spine. Frequently used by powerhouse style wrestlers. ",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 5}]
    });

holds.push(
    {
        id: 17,
        title: "Waist Lock",
        description: "A wrestler stands behind the opponent and then wraps both of their arms around them in a reverse bear hug, sometimes clutching their hands together by the wrist for added pressure.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        bonusRoll: "2", // All "Grapple: Throw" attacks with 'Suplex' in the name gain +2 to Hit. 
        bonusForAttacks: "", // @INCOMPLETE
        holdType: "strength",
        maxTurns: "2",
        stanceRequirements: "supine",
        statRequirements: [{strength: 5}]
    });

holds.push(
    {
        id: 18,
        title: "Body Scissors",
        description: " A wrestler approaches a sitting opponent from in front, behind, or either sides. The attacking wrestler then sits next to the opponent and wraps her legs around the opponent, crossing her ankles and then tightening her grip by squeezing together her thighs or straightening her legs to choke the wrestler by compressing his torso. ",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, agility: 3}]
    });

holds.push(
    {
        id: 19,
        title: "Body Scissors + Chin Lock",
        description: "Following up the body scissors, the wrestler holds the opponent's chin, drawing them back to stretch the torso while squeezing it between the thighs.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].toughness", //(User's Strength * 2 - Target's Toughness)
        holdType: "strength",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, agility: 4, flexibility: 4}]
    });

holds.push(
    {
        id: 19,
        title: "Bow and Arrow",
        description: "The wrestler kneels on his opponent's back with both knees, hooking the head with one arm and the legs with the other. He then rolls back so that his opponent is suspended on his knees above him, facing up. The wrestler pulls down with both arms while pushing up with the knees to bend the opponent's back.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 4}]
    });

holds.push(
    {
        id: 20,
        title: "Cobra Twist",
        description: "This hold begins with a wrestler facing his opponent's side. The wrestler first straddles one of the opponent's legs, then reaches over the opponent's near arm with the arm close to the opponent's back and locks it. Squatting and twisting to the side, flexes the opponent's back and stretches their abdomen.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 4}]
    });

holds.push(
    {
        id: 21,
        title: "Black Widow",
        description: "The wrestler stands behind the opponent and hooks a leg over the opponent's opposite leg. The wrestler then forces the opponent to one side, traps one of the opponent's arms with their own arm, and drapes their free leg over the neck of the opponent, forcing it downward. This elevates the wrestler and places all the weight of the wrestler on the opponent. The wrestler has one arm free, which can be used for balance.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{flexibility: 6}]
    });

holds.push(
    {
        id: 22,
        title: "Surfboard",
        description: "The surfboard hold first sees a wrestler stand behind a fallen opponent, who is lying stomach first to the floor. The wrestler places one foot down just above each of the opponent's knees and bends their legs up, hooking them around their own knees; at this point the wrestler grasps both of their opponent's wrists (usually slapping the opponent's back in an attempt to bring the arms in reach), and falls backwards while compressing the opponent's shoulder-blades and lifting their off the ground. ",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 4}]
    });

holds.push(
    {
        id: 23,
        title: "Seated Surfboard",
        description: "TThis can see the wrestler fall to a seated position or go onto their back, lifting the opponent skyward, which will increase pressure on the opponent. The wrestler grasp both of his opponent's wrists, while placing their foot or knee on the opponent's upper back, pulling back on the arms to compress the opponent's shoulder blades.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, flexibility: 4}]
    });

holds.push(
    {
        id: 24,
        title: "Lotus Lock",
        description: "TThe wrestler grabs the opponent's arms and wraps their legs on the outside of them, so the wrestler's feet meet at the back of the neck of the opponent and exert a downward pressure, akin to applying a full nelson but by using the legs.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        // If the user's Flexibility is 6 or greater, increase the Hit dice of any attack using the arms by +1. f the user's Flexibility is 8 or greater, increase the Hit dice of any attack using the arms by +2 instead. 
        // > flex 6 condition not implemented 
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 4, agility: 4}]
    });

//////////////////////////////////////
// CHOKES
//////////////////////////////////////

holds.push(
    {
        id: 25,
        title: "Arm-Hook Sleeper",
        description: "This choke sees the wrestler kneeling behind a seated opponent before grabbing hold of one of the opponent's arms, bending it backwards overhead, and locking the opponent's wrist into the attacker's armpit. The wrestler then wraps his free arm under the opponent's chin, like in a sleeper hold, puts his other arm through the arch created by the opponent's trapped arm, and locks his hands.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 3}]
    });

holds.push(
    {
        id: 26,
        title: "Arm-Triangle Choke Hold",
        description: "This choke sees the wrestler wrapping their arm from under the opponent's nearest arm (pit) and across the chest. ",
        damageHP: "0", // Special attack
        bonusRoll: "2", // Increase the Hit dice of "Arm-Triangle Reverse STO" or "Arm-Trap-Triangle Choke Hold" by +2 
        bonusForAttacks: "holds:27", // @INCOMPLETE
        holdType: "special",
        maxTurns: "10",
        stanceRequirements: "supine",
        statRequirements: [{strength: 2, dexterity: 2, flexibility: 2}]
    });

holds.push(
    {
        id: 27,
        title: "Arm-Trap-Triangle Choke Hold",
        description: "The technique is done from a position in which the wrestler and the opponent are seated on the mat facing each other. The wrestler sits on one side of the opponent and using his near arm encircles the opponent in a headlock position and grabs the opponent's near wrist, bending the arm upwards. Then, the wrestler maneuvers their other arm through the \"hole\" created by the opponent's bent wrist, locks their hand upon their own wrist, and then pulls the opponent forward, causing pressure on the opponent's arm and neck.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].toughness", //(User's Strength * 2 - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 4, flexibility: 4}]
    });

holds.push(
    {
        id: 28,
        title: "Pentagram Choke ",
        description: " In this variation of the triangle choke, the wrestler sits behind a seated opponent. The wrestler places one of their legs under the chin of the opponent and pushes up. The wrestler then takes hold of their ankle with their opposite arm and pulls their leg up. The wrestler then places their free leg on the instep of the leg which is already being used to choke the opponent. The wrestler finally takes their free arm, hooks the opponent's arm which is in the vise, and holds their opposite leg from the knee. The pressure is applied once the wrestler compresses their knees together. The pentagram choke creates a complete vise around the opponent's neck, and its name comes from using five sides, whereas the triangle choke only uses three.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].toughness", //(User's Strength * 2 - Target's Toughness)
        onEscape: "currentFighters[defender].dice.addTmpMod(-1)",
        holdType: "strength",
        maxTurns: "5",
        stanceRequirements: "supine",
        statRequirements: [{strength: 5, dexterity: 5, flexibility: 5}]
    });

holds.push(
    {
        id: 29,
        title: "Death Star Choke",
        description: "A variation of the pentagram choke (above), what makes this version different is that usually the wrestler will use their free hand to hold on to their own knee before compressing their knees together to apply the pressure. However, in the death star, the wrestler uses their free hand to maneuver under the leg which is first utilized to create the choke and then take hold of the ankle of their other leg.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].toughness", //(User's Strength * 2 - Target's Toughness)
        onEscape: "currentFighters[defender].dice.addTmpMod(-2)",
        holdType: "strength",
        maxTurns: "5",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, dexterity: 6, flexibility: 6, agility: 6}]
    });

holds.push(
    {
        id: 30,
        title: "Arm Choke",
        description: "The wrestler grabs his opponent's throat with both hands and throttles him.",
        damageHP: "1", // Does 1 Health Damage per turn regardless of the Strength or Toughness stats 
        onEscape: "currentFighters[defender].dice.addTmpMod(-1)",
        bonusRoll: "2", // Increase the Hit Dice of "Choke Slam" by +2
        bonusForAttacks: "", // @INCOMPLETE
        holdType: "strength",
        maxTurns: "2",
        stanceRequirements: "supine",
        statRequirements: [{strength: 5, dexterity: 4, flexibility: 4}]
    });

holds.push(
    {
        id: 31,
        title: "Figure Four Neck Lock",
        description: "This neck lock sees a wrestler sit above a fallen opponent and wrap their legs around the opponent in the form of the figure-four, with one leg crossing under the opponent's chin and under the wrestler's other leg the wrestler squeezes and chokes the opponent.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 3}]
    });

holds.push(
    {
        id: 32,
        title: "Hanging Figure Four Neck Lock",
        description: "The wrestler stands on top of the turnbuckle or over the top rope, wraps their legs around the head of the opponent (who has their back turned against the turnbuckle or rope) in the figure-four and falls backwards, choking the opponent and hanging on the outside of the ring.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].toughness", //(User's Strength * 2 - Target's Toughness)
        holdType: "strength",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, flexibility: 4, agility: 4}]
    });

holds.push(
    {
        id: 33,
        title: "Guillotine Choke",
        description: "The wrestler faces his opponent who is bent over. The attacking wrestler tucks the opponent's head underneath his armpit and wraps his arm around the neck so that the forearm is pressed against the throat as in a front chancery. The attacking wrestler then wraps his legs around the opponents midsection with a body scissors and then arches backwards, pulling the opponent's head forward, stretching the torso and the neck.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 6, agility: 4}]
    });

holds.push(
    {
        id: 34,
        title: "Head Scissors",
        description: "This hold sees a wrestler approach a supine opponent and sit next to them before turning onto their side towards the opponent and wrapping their legs around either side of the opponent's head, crossing the top leg after it has gone around the opponent's chin. The wrestler then tightens his grip to choke an opponent by compressing their throat. ",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, agility: 3}]
    });

holds.push(
    {
        id: 35,
        title: "Standing Head Scissors",
        description: "The wrestler tucks a bent over opponent's head in between his legs or thighs.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's toughness)
        bonusRoll: "2", //  Increase the Hit Dice of Pile Driver and Power Bomb by +2. 
        bonusForAttacks: "", // @INCOMPLETE
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, agility: 5}]
    });

holds.push(
    {
        id: 36,
        title: "Sleeper Hold",
        description: "The wrestler applying the hold positions himself behind his opponent. The wrestler then wraps their arm around the opponent's neck, pressing the biceps against one side of the neck and the inner bone of the forearm against the other side. The neck is squeezed inside the arm very tightly. Additional pressure can be applied by grabbing the left shoulder with the right hand, or grabbing the biceps of the left arm near the elbow, then using the left hand to push the opponent's head towards the crook of the right elbow.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 3}, {strength: 4, agility: 3}]
    });

holds.push(
    {
        id: 37,
        title: "Straight Jacket",
        description: "The wrestler sits on the back of an opponent who is lying face down on the mat. The wrestler then grabs hold of the opponent's wrists and crosses their arms under their chin. The wrestler then pulls back on the arms, causing pressure.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 3}, {strength: 4, agility: 3}]
    });

//////////////////////////////////////
// LEG LOCKS
//////////////////////////////////////

holds.push(
    {
        id: 38,
        title: "Boston Crab",
        description: "This typically starts with the opponent on his back, and the wrestler standing and facing him. The wrestler hooks each of the opponent's legs in one of his arms, and then turns the opponent face-down, stepping over him in the process. The final position has the wrestler in a semi-sitting position and facing away from his opponent, with the opponent's back and legs bent back toward his face.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4}]
    });

holds.push(
    {
        id: 39,
        title: "Rocking Chair",
        description: " The opponent is face down on the mat, with the attacker bending both of their legs up and tucking their ankles against his armpits. He then reaches down and grabs both of the opponent's arms before sitting down, 'rocking' back and forth and stretching the back.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4}]
    });

//////////////////////////////////////
// STRECHED SUBMISSIONS
//////////////////////////////////////

holds.push(
    {
        id: 40,
        title: "Camel Clutch",
        description: "A camel clutch can also refer simply to a rear chinlock while seated on the back of an opponent, without placing the arms on the thighs ",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 3}, {strength: 4, agility: 3}]
    });

holds.push(
    {
        id: 41,
        title: "Leg Trap: Camel Clutch",
        description: "The attacking wrestler stands over a face down opponent, facing the same direction. The wrestler first hooks each of the opponent's legs underneath his own armpits as if performing a reverse Boston crab, the wrestler then reaches down and underneath the opponent's chin with both hands applying a chinlock, finally leaning back to pull up the opponent's head and neck.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, flexibility: 4, dexterity: 4}, {strength: 4, flexibility: 4, agility: 4}]
    });

holds.push(
    {
        id: 42,
        title: "Chin Lock",
        description: "The attacking wrestler crouches down behind a sitting opponent and places their knee into the opponent's upper back, they then reach forward and grasp the opponent's chin with one or both hands.",
        damageHP: "0", // Special Attack
        bonusRoll: "2", //  increases the 'Hit dice' of 'Forced Kissing' by +2. . 
        bonusForAttacks: "sexual:5", // Forced Kissing
        holdType: "special",
        maxTurns: "10",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 3}, {strength: 4, agility: 3}]
    });

holds.push(
    {
        id: 43,
        title: "Claw-Hold",
        description: "The claw involves the attacker gripping the top of the head of the opponent with one hand and squeezing the tips of their fingers into the opponent's skull, thereby applying five different points of pressure.",
        damageHP: "5", // Special Attack that does 5
        holdType: "special",
        // @INCOMPLETE Missing the dice reduction 
        maxTurns: "1",
        stanceRequirements: "supine",
        statRequirements: [{strength: 8}]
    });

holds.push(
    {
        id: 44,
        title: "Head Vice",
        description: "The wrestler performing the hold approaches their opponent and grips their head with both hands. While in the vice, the attacking wrestler can control their opponent by squeezing the temples and bring them down to a seated position where more pressure can be exerted.",
        damageHP: "7", // Special Attack that does 7 dmg
        holdType: "special",
        onEscape: "currentFighters[defender].dice.addTmpMod(-3)", // Lower's the 'Hit dice' of all the opponent's next attack by 3. 
        maxTurns: "1",
        stanceRequirements: "supine",
        statRequirements: [{strength: 10}]
        // Not checked if once per match so far
    });

holds.push(
    {
        id: 45,
        title: "Shoulder Claw-Hold",
        description: "Similar to a claw-hold, the attacking wrestler applies a nerve lock onto the opponent's shoulder by using their hands and fingers to dig in and compress the top of the shoulder. Usually performed with the attacking wrestler standing behind a seated opponent.",
        damageHP: "5", // Special Attack that does 5
        holdType: "special",
        // @INCOMPLETE Missing the dice reduction 
        maxTurns: "1",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, endurance: 3}]
    });

holds.push(
    {
        id: 46,
        title: "Cobra Clutch",
        description: "The wrestler stands behind the opponent and uses one arm to place the opponent in a half nelson. The wrestler then uses his free arm to pull the opponent's arm (the same arm to which the wrestler is applying the half nelson) across the face of the opponent. The wrestler then locks his hand to his wrist behind the opponent's neck to make the opponent submit or lose consciousness.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, dexterity: 3}, {strength: 4, agility: 3}]
    });

holds.push(
    {
        id: 47,
        title: "Bridging Cobra Clutch",
        description: "With the opponent lying face down, the wrestler sits beside the opponent, facing the same way, locks on the cobra clutch, and then arches his legs and back, bending the opponent's torso and neck upwards.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's Flexibility)
        holdType: "flexibility",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, flexibility: 4, dexterity: 4}, {strength: 6, flexibility: 4, agility: 4}]
    });

holds.push(
    {
        id: 48,
        title: "Cross Face",
        description: "This neck crank sees the wrestler wrap both hands around the opponent's face and pull back, which applies pressure to the neck and shoulder area. The move is performed in several ways, usually involving the wrestler trapping one of the opponent's arms",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].toughness", //(User's Strength - Target's toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 3}]
    });

holds.push(
    {
        id: 49,
        title: "Chicken Wing Cross Face",
        description: "The wrestler goes to a fallen opponent and places one arm over the wrestler's nearest shoulder before applying the crossface where the attacking wrestler locks his hands around the opponent's chin (or lower face), then pulls back, stretching the opponent's neck and shoulder",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 3}]
    });

holds.push(
    {
        id: 50,
        title: "Straight Jacket Cross Face",
        description: "Similar to a cross face this move sees a wrestler standing above a face down opponent. The wrestler then crosses their opponent's arms, keeping them in place with the legs before applying the cross face.",
        damageHP: "currentFighters[attacker].strength - currentFighters[defender].flexibility", //(User's Strength - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, agility: 2}]
    });

holds.push(
    {
        id: 51,
        title: "Face Lock",
        description: "The wrestler faces his opponent who is bent over. The attacking wrestler tucks the opponent's head underneath his armpit and wraps his arm around the head so that the forearm is pressed against the face. The wrestler then grabs his own arm with his free hand to lock in the hold and compress the opponent's face. Similar in execution to a front chancery, the front facelock is often used as a setup for a suplex throw.",
        damageHP: "0", // Special Attack
        bonusRoll: "2", //  If the opponent is still trapped on your next turn, gain +2 to 'Hit Dice' for any "Grapple: Throw" attack or "Forced Fingering" or Forced Cock Stroking" attacks and a +1 to 'Hit Dice' to all other attacks except for Grapple: Holds 
        // @INCOMPLETE Missing bonus stuff
        bonusForAttacks: "", 
        holdType: "special",
        maxTurns: "10",
        stanceRequirements: "supine",
        statRequirements: [{strength: 1, dexterity: 1}, {strength: 1, agility: 1}]
    });

holds.push(
    {
        id: 52,
        title: "Bite of the Dragon",
        description: "This move sees the attacking wrestler behind a standing opponent, pulling them backwards into an inverted facelock and wrapping their legs around the opponent's body with a body scissors. The attacker then arches backwards, putting pressure on the opponents neck and spine.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 4, agility: 4}]
    });

holds.push(
    {
        id: 53,
        title: "Nelson Hold",
        description: "The wrestler slips either one or both arms underneath the opponent's armpits and locks his hands behind his neck, pushing the opponent's head forward against his chest. ",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].toughness", //(User's Strength * 2 - Target's Toughness)
        holdType: "strength",
        maxTurns: "3",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, dexterity: 4}]
    });

holds.push(
    {
        id: 54,
        title: "Step-over Toe hold Face lock (STF)",
        description: "This hold is performed on an opponent who is lying face down on the mat. A wrestler grabs one of the opponent's legs, and places the opponent's ankle between their thighs. The wrestler then lies on top of the opponent's back and locks his arms around the opponent's head. The wrestler then pulls back stretching the opponent's back, neck, and knee.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's flexibility)
        holdType: "flexibility",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 4, dexterity: 4, agility: 4}]
    });

holds.push(
    {
        id: 55,
        title: "Step-over Toe hold Sleeper hold (STS)",
        description: "This hold is performed on an opponent who is lying face down on the mat. A wrestler grabs one of the opponent's legs, and places the opponent's ankle between their thighs. The wrestler then lies on top of the opponent's back and wraps his arm around the neck of the opponent in a sleeper hold. The wrestler then pulls back stretching the opponent's back, neck, and knee while continuing to apply the sleeper hold.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's flexibility)
        onEscape: "currentFighters[defender].dice.addTmpMod(-1)",
        holdType: "flexibility",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 5, flexibility: 5, dexterity: 5, agility: 5}]
    });

holds.push(
    {
        id: 56,
        title: "Muta-Lock",
        description: "The wrestler first takes the opponent's legs then, bends them at the knees, and crosses them, placing one ankle in the other leg's knee-pit before then turning around so that they are facing away from the opponent and places one of their feet into the triangle created by the opponent's crossed legs. The wrestler then places the opponent's free ankle under their knee-pit and bridges backwards to reach over their head and locks their arms around the opponent's head.",
        damageHP: "currentFighters[attacker].strength * 2 - currentFighters[defender].flexibility", //(User's Strength * 2 - Target's flexibility)
        bonusRoll: "2", //  increases the 'Hit dice' of 'Forced Kissing' by +2. . 
        bonusForAttacks: "sexual:5", // Forced Kissing
        holdType: "flexibility",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 7, dexterity: 3, agility: 7}]
    });

//////////////////////////////////////
// TRANSITION HOLDS
//////////////////////////////////////

// Arm Wrench is listed here too but also in Arm Lock. Not going to dublicate it

holds.push(
    {
        id: 57,
        title: "Wrist Lock",
        description: "the wrestler grasps the opponent's hand and twists backwards, placing pressure on the wrist. While this can inflict pain on its own, it is most often used as a transition hold.",
        damageHP: "0", // special attack
        bonusRoll: "2", //  ncrease the Hit dice of any Grapple: Holds - "Arm Lock" technique by +2. . 
        bonusForAttacks: "holds:1, holds:2, holds:3, holds:4, holds:5, holds:6, holds:7, holds:8, holds:9, holds:10, holds:11, holds:12, holds:13 ,holds:14", // Grapple: Holds - "Arm Lock"
        holdType: "special",
        maxTurns: "10",
        stanceRequirements: "supine",
        statRequirements: [{strength: 4, flexibility: 7, dexterity: 3, agility: 7}]
    });

module.exports = holds;
