var features = [];

features.push(
    {
        id: 0,
        title: "Hair trigger",
        description: "Your Endurance can never rise above 1 but you gain +1 to another Attribute on character creation (Cannot be taken with Multiple Orgasms)",
        incompatibility: 2
    });
features.push(
    {
        id: 1,
        title: "Imposing Dominance",
        description: "Your dominance is... imposing! Characters who are intimidated by or acknowledge your character's dominance suffer a -1 to all their rolls against you or escaping your holds. Characters who are riled up by your dominant demeanor gain +1 to all their rolls against you."
    });
features.push(
    {
        id: 2,
        title: "Multiple Orgasms",
        description: "You lose 50% of the agreed upon Stamina penalty after an orgasm but your Endurance decreases by 1 (instead of increasing by 1) after each orgasm as it becomes easier to drive you closer to the next orgasm after the first. (Cannot be taken with Hair Trigger) ",
        incompatibility: 0
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

module.exports = features;