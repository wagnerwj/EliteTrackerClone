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
				unique: true,
				fields: ['source', 'guildID', 'marketID', 'commodity'],
			},
		],
	},
);

module.exports = Message;
