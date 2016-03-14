var classes = [];

classes.push(
    {
        id: 0,
        title: "Brawler",
        description: "Your Endurance can never rise above 1 but you gain +1 to another Attribute on character creation (Cannot be taken with Multiple Orgasms)"
    });
classes.push(
    {
        id: 1,
        title: "Acrobat",
        description: "Your dominance is... imposing! Characters who have the \"Sub-Space\" Feature suffer a -2 to all their rolls against you or escaping your holds.",
        incompatibility: 8
    });

classes.push(
    {
        id: 2,
        title: "Submission Specialist",
        description: "You lose 50% of the agreed upon Stamina penalty after an orgasm but your Endurance decreases by 1 (instead of increasing by 1) after each orgasm as it becomes easier to drive you closer to the next orgasm after the first. (Cannot be taken with Hair Trigger) "
    });

classes.push(
    {
        id: 3,
        title: "Sex Fiend",
        stats: []
    });


module.exports = classes;