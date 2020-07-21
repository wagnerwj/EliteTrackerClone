const Sequelize = require('sequelize');
const db = require('./connection');

const OverlapAdmin = db.define('overlap_admin', {
	adminID: {
		type: Sequelize.STRING,
		unique: true,
	},
});

module.exports = OverlapAdmin;
