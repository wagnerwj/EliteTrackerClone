const Sequelize = require('sequelize');
const { db2: db } = require(process.env.CONFIG_PATH || '../config.json');

const sequelize = new Sequelize(db.database, db.username, db.password, db.options);

module.exports = sequelize;
