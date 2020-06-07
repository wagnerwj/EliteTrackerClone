const Sequelize = require('sequelize');
const db = require('./connection');

const Hotspot = db.define('hotspot', {
	system_name: Sequelize.STRING,
	system_id64: Sequelize.BIGINT,
	body_name: Sequelize.STRING,
	reporter: Sequelize.STRING,
	reporter_id: Sequelize.STRING,
	description: Sequelize.TEXT,
});

module.exports = Hotspot;
