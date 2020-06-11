const Hotspot = require('../../database/hotspot');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
	name: 'stats',
	description: 'hotspots statistic',
	aliases: ['stat', 'statistic'],
	async execute(message) {
		const hotspots = await Hotspot.findAll({ where: {
			approver_id: {
				[Op.ne]: null,
			},
		} });

		const systems = {};
		const bodies = {};
		const reporter = {};
		const amountOfCommodity = {};
		const amountOfCommodityOverlaps = {};
		for (const hotspot of hotspots) {
			if (!systems[hotspot.system_name]) {
				systems[hotspot.system_name] = 0;
			}
			systems[hotspot.system_name]++;

			if (!bodies[hotspot.body_name]) {
				bodies[hotspot.body_name] = 0;
			}
			bodies[hotspot.body_name]++;

			if (!reporter[hotspot.reporter]) {
				reporter[hotspot.reporter] = 0;
			}
			reporter[hotspot.reporter]++;

			if (!amountOfCommodity[hotspot.commodity]) {
				amountOfCommodity[hotspot.commodity] = 0;
			}
			amountOfCommodity[hotspot.commodity]++;

			if (!amountOfCommodityOverlaps[`${hotspot.commodity} x${hotspot.overlaps}`]) {
				amountOfCommodityOverlaps[`${hotspot.commodity} x${hotspot.overlaps}`] = 0;
			}
			amountOfCommodityOverlaps[`${hotspot.commodity} x${hotspot.overlaps}`]++;
		}

		let text = `**Hotspot overlap statstic**
Reports: ${hotspots.length}
Systems: ${Object.keys(systems).length}
Bodies: ${Object.keys(bodies).length}
Reporters: ${Object.keys(reporter).length}

`;

		text += 'Amount of commodities:\n';
		for (const commodity of Object.keys(amountOfCommodity).sort()) {
			text += `- ${commodity}: ${amountOfCommodity[commodity]}\n`;
		}
		text += '\nAmount of commodities per overlap count:\n';
		for (const commodity of Object.keys(amountOfCommodityOverlaps).sort()) {
			text += `- ${commodity}: ${amountOfCommodityOverlaps[commodity]}\n`;
		}

		return message.channel.send(text, { split: true });
	},
};
