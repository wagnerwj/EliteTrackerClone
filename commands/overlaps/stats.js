const Overlap = require('../../database2/overlap');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { commoditiesTranslation } = require('./data');

module.exports = {
	name: 'stats',
	description: 'hotspot overlap statistic',
	aliases: ['stat', 'statistic'],
	async execute(message) {
		const hotspots = await Overlap.findAll({ where: {
			approverID: {
				[Op.ne]: null,
			},
		} });

		const systems = {};
		const bodies = {};
		const reporter = {};
		const amountOfCommodity = {};
		const amountOfCommodityOverlaps = {};
		for (const hotspot of hotspots) {
			if (!systems[hotspot.systemName]) {
				systems[hotspot.systemName] = 0;
			}
			systems[hotspot.systemName]++;

			if (!bodies[hotspot.bodyName]) {
				bodies[hotspot.bodyName] = 0;
			}
			bodies[hotspot.bodyName]++;

			if (!reporter[hotspot.reporter]) {
				reporter[hotspot.reporter] = 0;
			}
			reporter[hotspot.reporter]++;

			if (!amountOfCommodity[commoditiesTranslation[hotspot.commodity]]) {
				amountOfCommodity[commoditiesTranslation[hotspot.commodity]] = 0;
			}
			amountOfCommodity[commoditiesTranslation[hotspot.commodity]]++;

			if (!amountOfCommodityOverlaps[`${commoditiesTranslation[hotspot.commodity]} x${hotspot.overlaps}`]) {
				amountOfCommodityOverlaps[`${commoditiesTranslation[hotspot.commodity]} x${hotspot.overlaps}`] = 0;
			}
			amountOfCommodityOverlaps[`${commoditiesTranslation[hotspot.commodity]} x${hotspot.overlaps}`]++;
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
