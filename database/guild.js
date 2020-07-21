const Sequelize = require('sequelize');
const db = require('./connection');

const Guild = db.define('guild', {
	guildID: {
		type: Sequelize.STRING,
		unique: true,
	},
	marketAnnouncementsEnabled: Sequelize.BOOLEAN,
	marketAnnouncementsChannel: Sequelize.STRING,
	marketStateCheckEnabled: Sequelize.BOOLEAN,
	marketStateCheckChannel: Sequelize.STRING,
	adminRoleID: Sequelize.STRING,
});

module.exports = Guild;
