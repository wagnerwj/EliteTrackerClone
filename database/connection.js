const Sequelize = require('sequelize');
const { db } = require('../config.json');

const sequelize = new Sequelize(db.database, db.username, db.password, db.options);

module.exports = sequelize;
