const Sequelize = require('sequelize');
const db = require('./connection');

const FleetCarrierMarketCommodity = db.define('fleetcarrier', {
	station_name: {
		type: Sequelize.STRING,
		unique: true,
	},
	market_id: Sequelize.BIGINT,
	services: Sequelize.STRING,

	system_address: Sequelize.BIGINT,
	star_system: Sequelize.STRING,
	star_position_x: Sequelize.DECIMAL(10, 10),
	star_position_y: Sequelize.DECIMAL(10, 10),
	star_position_z: Sequelize.DECIMAL(10, 10),
	body_name: Sequelize.STRING,
	body_id: Sequelize.INTEGER,
});

module.exports = FleetCarrierMarketCommodity;
