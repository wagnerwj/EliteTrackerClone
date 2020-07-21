const Sequelize = require('sequelize');
const db = require('./connection');

const FleetCarrier = db.define('fleetcarrier', {
	stationName: Sequelize.STRING,
	marketID: Sequelize.BIGINT,
	services: Sequelize.STRING,

	systemAddress: Sequelize.BIGINT,
	starSystem: Sequelize.STRING,
	bodyName: Sequelize.STRING,
	bodyID: Sequelize.INTEGER,
}, {
	indexes: [
		{
			unique: true,
			fields: ['marketID'],
		},
	],
});

module.exports = FleetCarrier;
