const Overlap = require('../../database/overlap');
const { allowedCommodities, commoditiesMap } = require('./data');

module.exports = {
	name: 'fix',
	description: 'Fix data',
	cooldown: 10,
	hidden: true,
	owner: true,
	async execute(message) {
		let changes = 0;
		const hotspots = await Overlap.findAll({});
		for (const hotspot of hotspots) {
			const commodity = allowedCommodities.find((c) => c.toLowerCase() === hotspot.commodity.toLowerCase());
			const inGameCommodity = commoditiesMap[commodity];
			if (inGameCommodity && inGameCommodity !== hotspot.commodity) {
				const affectedRows = await Overlap.update({
					commodity: inGameCommodity,
				}, {
					where: {
						id: hotspot.id,
					},
				});
				changes += affectedRows[0];
			}
		}

		return message.channel.send(`${changes} entries updated`);
	},
};
