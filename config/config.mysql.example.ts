const entitiesDir = __dirname + "/../plugins/NSFWClasses/";

module.exports = {
    driver: {
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "xx",
        password: "xx",
        database: "flistplugins"
    },
    entities: [
        entitiesDir + "Fighter.js",
        entitiesDir + "ActiveFighter.js",
        entitiesDir + "Action.js",
        entitiesDir + "Feature.js",
        entitiesDir + "Fight.js",
        entitiesDir + "Modifier.js"
    ],
    autoSchemaSync: true
};