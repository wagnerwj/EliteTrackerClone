const Sequelize = require('sequelize');
const db = require('./connection');

const HighSellAnnouncement = db.define(
	'highsell-announcement',
	{
		guild_id: Sequelize.STRING,
		message_id: Sequelize.STRING,
		market_id: Sequelize.BIGINT,
		material: Sequelize.STRING,
		highest_sell_price: Sequelize.INTEGER,
		timestamp: Sequelize.BIGINT,
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['guild_id', 'market_id', 'material'],
			},
		],
	},
);

module.exports = HighSellAnnouncement;
