const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Overlap = require('../../database/overlap');
const OverlapAdmin = require('../../database/overlap-admin');
const { commoditiesMap, commoditiesTranslation } = require('./data');

module.exports = {
	name: 'get-commodity',
	description: 'Get the raw commodity and overlap amount to update entry',
	usage: '[system name]',
	args: true,
	permission: 'hotspot overlap admin',
	async execute(message, args) {
		const admin = await OverlapAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot admin`);
		}

		let text = '';
		const hotspots = await Overlap.findAll({ where: {
			systemName: args.join(' '),
		} });
		const commodities = Object.keys(commoditiesMap).map((v) => ({ inGame: commoditiesMap[v], name: v }));
		for (const hotspot of hotspots) {
			const commodity = commodities.find((v) => v.inGame === hotspots.commodity).name;
			text += `Location **${hotspot.bodyName}**
Commodity **${commoditiesTranslation[hotspot.commodity]} x${hotspot.overlaps}**
> Reported at ${hotspot.createdAt.toUTCString()} from ${hotspot.reporter}:
\`\`\`
${prefix}overlaps update-commodity ${hotspot.id} ${commodity} ${hotspot.overlaps}
\`\`\`

`;
		}

		if (!text) {
			return message.channel.send('No hotspot overlaps found');
		}

		return message.channel.send(text, { split: true });
	},
};
