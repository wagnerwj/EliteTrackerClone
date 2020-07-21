const Sequelize = require('sequelize');
const db = require('./connection');

const Overlap = db.define('overlap', {
	systemName: Sequelize.STRING,
	systemID64: Sequelize.BIGINT,
	bodyName: Sequelize.STRING,
	commodity: Sequelize.STRING,
	overlaps: Sequelize.INTEGER,
	reporter: Sequelize.STRING,
	reporterID: Sequelize.STRING,
	approverID: Sequelize.STRING,
	description: Sequelize.TEXT,
});

module.exports = Overlap;
