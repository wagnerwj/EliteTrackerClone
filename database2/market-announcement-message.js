const Sequelize = require('sequelize');
const db = require('./connection');

const Message = db.define(
	'market_announcement_message',
	{
		guildID: Sequelize.STRING,
		marketID: Sequelize.STRING,
		commodity: Sequelize.STRING,
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['guildID', 'marketID', 'commodity'],
			},
		],
	},
);

module.exports = Message;
