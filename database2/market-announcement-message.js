const Sequelize = require('sequelize');
const db = require('./connection');

const Message = db.define(
	'market_announcement_message',
	{
		guildID: Sequelize.STRING,
		messageID: Sequelize.STRING,
		marketID: Sequelize.STRING,
		commodity: Sequelize.STRING,
		sellPrice: Sequelize.INTEGER,
		buyPrice: Sequelize.INTEGER,
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
