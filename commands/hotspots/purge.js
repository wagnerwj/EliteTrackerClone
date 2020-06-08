const Hotspot = require('../../database/hotspot');

module.exports = {
	name: 'purge',
	description: 'Purge all reported hotspot overlaps',
	usage: '',
	cooldown: 60,
	owner: true,
	async execute(message) {
		await Hotspot.destroy({ truncate : true });
		return message.channel.send('All reported hotspots deleted');
	},
};
