const Sequelize = require('sequelize');
const db = require('./connection');

const Trigger = db.define(
	'market_announcement_trigger',
	{
		guildID: Sequelize.STRING,
		source: Sequelize.STRING,
		commodity: Sequelize.STRING,
		operator: Sequelize.STRING,
		value: Sequelize.INTEGER,
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['guildID', 'source', 'commodity'],
			},
		],
	},
);

module.exports = Trigger;
