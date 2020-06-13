const Sequelize = require('sequelize');
const db = require('./connection');

const FleetCarrier = db.define('fleetcarrier', {
	stationName: Sequelize.STRING,
	marketID: Sequelize.BIGINT,
	services: Sequelize.STRING,

	systemAddress: Sequelize.BIGINT,
	starSystem: Sequelize.STRING,
	starPositionX: Sequelize.DECIMAL(10, 10),
	starPositionY: Sequelize.DECIMAL(10, 10),
	starPositionZ: Sequelize.DECIMAL(10, 10),
	bodyName: Sequelize.STRING,
	bodyID: Sequelize.INTEGER,
}, {
	indexes: [
		{
			unique: true,
			fields: ['stationName'],
		},
	],
});

module.exports = FleetCarrier;
