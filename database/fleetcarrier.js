const Sequelize = require('sequelize');
const db = require('./connection');

const FleetCarrier = db.define('fleetcarrier2', {
	station_name: Sequelize.STRING,
	market_id: Sequelize.BIGINT,
	services: Sequelize.STRING,

	system_address: Sequelize.BIGINT,
	star_system: Sequelize.STRING,
	star_position_x: Sequelize.DECIMAL(10, 10),
	star_position_y: Sequelize.DECIMAL(10, 10),
	star_position_z: Sequelize.DECIMAL(10, 10),
	body_name: Sequelize.STRING,
	body_id: Sequelize.INTEGER,

	inserted: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW,
	},
	updated: Sequelize.DATE,
	deleted: Sequelize.DATE,
}, {
	indexes: [
		{
			unique: true,
			fields: ['station_name', 'deleted'],
		},
	],
});

module.exports = FleetCarrier;
