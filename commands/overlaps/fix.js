const Overlap = require('../../database2/overlap');
const { allowedCommodities } = require('./data');

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
			if (commodity && commodity !== hotspot.commodity) {
				const affectedRows = await Overlap.update({
					commodity: commodity,
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
