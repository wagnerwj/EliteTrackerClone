const Sequelize = require('sequelize');
const db = require('./connection');

const Message = db.define(
	'market_announcement_message',
	{
		guildID: Sequelize.STRING,
		messageID: Sequelize.STRING,
		source: Sequelize.STRING,
		marketID: Sequelize.STRING,
		commodity: Sequelize.STRING,
		price: Sequelize.INTEGER,
	},
	{
		indexes: [
			{
				name: 'market_announcement_message_idx',
				unique: true,
				fields: ['source', 'guildID', 'marketID', 'commodity'],
			},
		],
	},
);

module.exports = Message;
