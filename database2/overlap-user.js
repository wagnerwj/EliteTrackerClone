const Sequelize = require('sequelize');
const db = require('./connection');

const OverlapUser = db.define('overlap_user', {
	userID: {
		type: Sequelize.STRING,
		unique: true,
	},
	adminID: Sequelize.STRING,
});

module.exports = OverlapUser;
