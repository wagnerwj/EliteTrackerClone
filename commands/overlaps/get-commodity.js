const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Hotspot = require('../../database2/hotspot');
const HotspotAdmin = require('../../database2/hotspot-admin');

module.exports = {
	name: 'get-commodity',
	description: 'Get the raw commodity and overlap amount to update entry',
	usage: '[system name]',
	args: true,
	permission: 'hotspot overlap admin',
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot admin`);
		}

		let text = '';
		const hotspots = await Hotspot.findAll({ where: {
			systemName: args.join(' '),
		} });
		for (const hotspot of hotspots) {
			text += `Location **${hotspot.bodyName}**
Commodity **${hotspot.commodity} x${hotspot.overlaps}**
> Reported at ${hotspot.createdAt.toUTCString()} from ${hotspot.reporter}:
\`\`\`
${prefix}overlaps update-commodity ${hotspot.id} ${hotspot.commodity} ${hotspot.overlaps}
\`\`\`

`;
		}

		if (!text) {
			return message.channel.send('No hotspot overlaps found');
		}

		return message.channel.send(text, { split: true });
	},
};
