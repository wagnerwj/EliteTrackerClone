const Hotspot = require('../../database2/hotspot');
const HotspotAdmin = require('../../database2/hotspot-admin');
const { allowedCommodities } = require('./data');

module.exports = {
	name: 'update-commodity',
	args: true,
	usage: '[hotspot overlap id] [commodity] [overlap amount]',
	permission: 'hotspot overlap admin',
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot overlap admin`);
		}

		const hotspotID = +args.shift();
		const commodityName = args.shift();
		const overlaps = +args.shift();

		if (isNaN(hotspotID) || hotspotID <= 0) {
			return message.channel.send('Wrong hotspot id');
		}
		const commodity = allowedCommodities.find((c) => c.toLowerCase() === commodityName.toLowerCase());
		if (!commodity) {
			return message.channel.send(`Commodity ${commodity} is not in the allowed commodity list, ensure it is correctly written`);
		}
		if (isNaN(overlaps) || overlaps <= 0) {
			return message.channel.send('Number of overlaps needed to be greater than 0');
		}

		const affectedRows = await Hotspot.update({
			commodity: commodity,
			overlaps: overlaps,
		}, {
			where: {
				id: hotspotID,
			},
		});
		if (affectedRows[0] === 0) {
			return message.channel.send('No hotspot overlaps found');
		}

		return message.channel.send('Updated');
	},
};
