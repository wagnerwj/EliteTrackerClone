const Hotspot = require('../../database2/hotspot');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { allowedCommodities } = require('./data');

module.exports = {
	name: 'locations',
	description: 'List all location for a given commodity',
	aliases: ['loc', 'location'],
	args: true,
	usage: '[commodity]',
	async execute(message, args) {
		const commodity = allowedCommodities.find((c) => c.toLowerCase() === args[0].toLowerCase());
		if (!commodity) {
			return message.channel.send(`Unknown commodity ${commodity}`);
		}

		const hotspots = await Hotspot.findAll({ where: {
			approverID: {
				[Op.ne]: null,
			},
			commodity: commodity,
		} });
		const locations = {};
		for (const hotspot of hotspots) {
			if (!locations[hotspot.systemName]) {
				locations[hotspot.systemName] = {};
			}
			if (!locations[hotspot.systemName][hotspot.bodyName]) {
				locations[hotspot.systemName][hotspot.bodyName] = [];
			}
			locations[hotspot.systemName][hotspot.bodyName].push(`x${hotspot.overlaps}`);
		}

		let text = '';
		for (const systemName of Object.keys(locations).sort()) {
			text += `${systemName}:\n`;
			for (const bodyName of Object.keys(locations[systemName]).sort()) {
				text += `- ${bodyName} (${locations[systemName][bodyName].sort().reverse().join(',')})\n`;
			}
		}

		if (!text) {
			return message.channel.send('No hotspots found');
		}

		return message.channel.send(`**Showing locations for ${commodity} and the overlap amount:**\n\n${text}`, { split: true });
	},
};
