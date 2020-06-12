const Sequelize = require('sequelize');
const db = require('./connection');

const HotspotUser = db.define('hotspot_user', {
	userID: {
		type: Sequelize.STRING,
		unique: true,
	},
	adminID: Sequelize.STRING,
});

module.exports = HotspotUser;
