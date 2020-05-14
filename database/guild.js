const Sequelize = require('sequelize');
const db = require('./connection');

const Guild = db.define('guild', {
	guild_id: {
		type: Sequelize.STRING,
		unique: true,
	},
	highsell_enabled: Sequelize.BOOLEAN,
	highsell_channel: Sequelize.STRING,
	admin_role_id: Sequelize.STRING,
});

module.exports = Guild;
