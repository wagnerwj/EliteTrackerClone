const Sequelize = require('sequelize');
const db = require('./connection');

const HotspotAdmin = db.define('hotspot_admin', {
	adminID: {
		type: Sequelize.STRING,
		unique: true,
	},
});

module.exports = HotspotAdmin;
