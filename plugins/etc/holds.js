var holds = [];

//stanceRequirements and holdType not set to final values yet!

// maxTurns: "100", means it has no max turns, dirty workaround

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
        title: "Cross Arm Bar ",
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
        maxTurns: "100",
        stanceRequirements: "supine",
        statRequirements: [{strength: 1, dexterity: 2 , agility: 2}]
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
        statRequirements: [{strength: 3, dexterity:4}]
    });

holds.push(    
        {
        id: 4,
        title: "Chicken Wing",
        description: "The wrestler grabs their opponent's arm, pulling it around behind the opponent's back. This stretches the pectorals and shoulder joint, and immobilizes the arm.",
        damageHP: "1", //( Does 1 Health Damage regardless of Strength and Toughness stats. )
        holdType: "strength",
        maxTurns: "100",
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
        maxTurns: "100",
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
        maxTurns: "100",
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
    
module.exports = holds;
