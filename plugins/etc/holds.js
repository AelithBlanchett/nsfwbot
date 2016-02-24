var holds = [];

//stanceRequirements and holdType not set to final values yet!

// maxTurns: "100", means it has no max turns, dirty workaround

// Some special attacks as still lacking bonus attack ids Marked with an @INCOMPLETE comment

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

holds.push(    
    {
        id: 1,
        title: "Cross Arm Bar ",
        description: "The wrestler sits on either side of an opponent who is lying either prone or supine on the mat, with the wrestler's legs scissoring one of the opponent's arms. The wrestler then grabs hold of the wrist of that arm and pulls it upwards, causing hyper extension of the shoulder and elbow.",
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].toughness", //(User's Strength - Target's Toughness)
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
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].toughness", //(User's Strength - Target's Toughness)
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
        bonusRoll: "1"
        bonusForAttacks: "holds:1, brawl:3" // Arm Bar, Arm-Twist Rope walk chop, Fireman's Carry, Irish Whip, Lariat @INCOMPLETE
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
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].flexibility", //(User's Strength - Target's Flexibility)
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
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].flexibility", //(User's Strength - Target's Flexibility)
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
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].toughness", //(User's Strength - Target's Toughness)
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
        bonusRoll: "4"
        bonusForAttacks: " " // enables use of Tiger Suplex, giving the attack a +4 to Hit. @INCOMPLETE
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
        damageHP: "currentFighters[currentFight.whoseturn].strength * 2 - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].flexibility", //(User's Strength - Target's flexibility)
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
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].flexibility", //(User's Strength - Target's flexibility)
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
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].flexibility", //(User's Strength - Target's flexibility)
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
        damageHP: "currentFighters[currentFight.whoseturn].strength * 2 - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].toughness", //(User's Strength - Target's toughness)
        // If the user's Flexibility is 4 or greater then they may also apply a "Body Scissors" hold with a +2 to Hit Dice the turn after this technique is used. 
        // The if Flex > 4 check is not implemented yet 
        bonusRoll: "4"
        bonusForAttacks: " " // @INCOMPLETE
        holdType: "strength",
        maxTurns: "4",
        stanceRequirements: "supine",
        statRequirements: [{strength: 6, dexterity: 4, agility: 4}]
    });

holds.push(    
        {
        id: 12,
        title: "Scissors Arm Bar",
        description: "The wrestler approaches a prone, face down opponent from the side. The wrestler then "scissors" (clasps) the near arm of the opponent with their legs and takes hold of the far arm of the opponent with both hands, forcing the opponent onto their side and placing stress on both shoulder joints, as well as making it harder for the opponent to breathe. It can cause serious injury to your opponent if held for long.",
        damageHP: "currentFighters[currentFight.whoseturn].strength - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].flexibility", //(User's Strength - Target's flexibility)
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
        damageHP: "currentFighters[currentFight.whoseturn].strength * 2 - currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].flexibility", //(User's Strength - Target's flexibility)
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
        bonusRoll: "2"
        bonusForAttacks: "holds:1, holds:2, holds:3, holds:4, holds:5, holds:6, holds:7, holds:8, holds:9, holds:10, holds:11, holds:12, holds:13 ,holds:14" // ALL Arm Lock holds
        holdType: "special",
        maxTurns: "100",
        stanceRequirements: "supine",
        statRequirements: [{strength: 2, dexterity: 2}]
    });
    
module.exports = holds;
