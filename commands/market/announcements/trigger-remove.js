const { allowedCommodities, commoditiesMap, commoditiesTranslation } = require('./../../overlaps/data');
const Trigger = require('../../../database2/market-announcement-trigger');

module.exports = {
	name: 'trigger-remove',
	description: 'Remove a trigger for market announcements',
	guildOnly: true,
	args: true,
	usage: '[source] [commodity]',
	admin: true,
	async execute(message, args) {
		const source = args.shift().toLowerCase();
		const commodityName = args.shift();

		const commodity = allowedCommodities.find((c) => c.toLowerCase() === commodityName.toLowerCase());
		if (!commodity) {
			return message.channel.send(`Commodity ${commodityName} is not known, ensure it is correctly written`);
		}
		const inGameCommodity = commoditiesMap[commodity];

		const affectedRows = await Trigger.destroy({ where: {
			guildID: message.guild.id,
			source: source,
			commodity: inGameCommodity,
		} });
		if (affectedRows < 1) {
			return message.channel.send(`No trigger for ${commoditiesTranslation[inGameCommodity]} found`);
		}

		return message.channel.send('Trigger removed');
	},
};
