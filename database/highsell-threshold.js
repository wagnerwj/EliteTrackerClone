const Sequelize = require('sequelize');
const db = require('./connection');

const HighSellThreshold = db.define(
	'highsell-threshold',
	{
		guild_id: Sequelize.STRING,
		material: Sequelize.STRING,
		minimum_price: Sequelize.INTEGER,
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['guild_id', 'material'],
			},
		],
	},
);

module.exports = HighSellThreshold;
