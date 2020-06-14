const Hotspot = require('../../database2/hotspot');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { allowedCommodities } = require('./data');

module.exports = {
	name: 'find',
	description: 'Find locations for a given commodity',
	args: true,
	usage: '[commodity] [overlap amount, optional]',
	async execute(message, args) {
		const commodityName = args.shift().toLowerCase();
		const overlapAmount = +args.shift();

		const commodity = allowedCommodities.find((c) => c.toLowerCase() === commodityName);
		if (!commodity) {
			return message.channel.send(`Unknown commodity ${commodity}`);
		}

		const filter = {
			approverID: {
				[Op.ne]: null,
			},
			commodity: commodity,
		};
		if (overlapAmount > 0) {
			filter['overlaps'] = { [Op.gte]: overlapAmount };
		}

		const hotspots = await Hotspot.findAll({ where: filter });
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
