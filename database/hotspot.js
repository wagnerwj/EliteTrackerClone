const Sequelize = require('sequelize');
const db = require('./connection');

const Hotspot = db.define('hotspot4', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	system_name: Sequelize.STRING,
	system_id64: Sequelize.BIGINT,
	body_name: Sequelize.STRING,
	commodity: Sequelize.STRING,
	overlaps: Sequelize.INTEGER,
	reporter: Sequelize.STRING,
	reporter_id: Sequelize.STRING,
	description: Sequelize.TEXT,
	approver_id: Sequelize.STRING,
});

module.exports = Hotspot;
