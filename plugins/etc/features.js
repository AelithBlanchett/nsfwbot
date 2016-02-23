var features = [];

features.push(
    {
        id: 0,
        title: "Hair trigger",
        description: "Your Endurance can never rise above 1 but you gain +1 to another Attribute on character creation (Cannot be taken with Multiple Orgasms)"
    });
features.push(
    {
        id: 1,
        title: "Imposing Dominance",
        description: "Your dominance is... imposing! Characters who have the \"Sub-Space\" Feature suffer a -2 to all their rolls against you or escaping your holds.",
        incompatibility: 8
    });
features.push(
    {
        id: 2,
        title: "Multiple Orgasms",
        description: "You lose 50% of the agreed upon Stamina penalty after an orgasm but your Endurance decreases by 1 (instead of increasing by 1) after each orgasm as it becomes easier to drive you closer to the next orgasm after the first. (Cannot be taken with Hair Trigger) "
    });
features.push(
    {
        id: 3,
        title: "Ryona Enthusiast",
        description: "Taking health damage from brawling attacks or submission holds also increases your lust by the same amount. "
    });
features.push(
    {
        id: 4,
        title: "Sadist",
        description: "Inflicting health damage from brawling attacks or submission holds increases your lust by the same amount. Your Endurance increases by +1 whenever your opponent loses 25%, 50% and 75% of their maximum health. "
    });
features.push(
    {
        id: 5,
        title: "Cum Slut",
        description: "Increase all Lust done by you and done to you by 1. Every time your opponent has a Climax increasing their Orgasm counter, increase your Lust by 1."
    });
//features.push(
//    {
//        id: 6,
//        title: "Exhibitionist",
//        description: "You're improperly dressed, but damn you love all those eyes ogling at you! Increase your opponent's Lust and your Lust by 1 at the start of each player's respective turn. If hit with a Brawling attack or a Grapple: Throw attack you take 1 extra damage. (Be careful of nipple-slips!). This cannot be taken with \"Stripped Down\".",
//        incompatibility: 7
//    });
//features.push(
//    {
//        id: 7,
//        title: "Stripped Down",
//        description: "Uh Oh! Wardrobe malfunction! Whether you were forcibly stripped in ring or had this forced on you by a bet, you're stuck without clothes now! Increase your opponent's Lust by 1 at the start of each of your opponent's turns. All Brawling and Grapple attacks you attempt have a -1 to Hit because of sheer embarrassment! If hit with a Brawling attack or a Grapple: Throw attack you take 1 extra damage. This cannot be taken with \"Lewd Attire\" as you are not intentionally wearing lewd attire or standing nude for the attention.",
//        incompatibility: 6
//    });
features.push(
    {
        id: 8,
        title: "Sub-Space",
        description: "You are easily brought to your knees by a domineering presence! Characters who have the \"Imposing Dominance\" Feature cause your character to suffer a -2 to all their rolls.",
        incompatibility: 1
    });

module.exports = features;