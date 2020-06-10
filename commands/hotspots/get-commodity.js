const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Hotspot = require('../../database/hotspot');
const HotspotAdmin = require('../../database/hotspot-admin');

module.exports = {
	name: 'get-commodity',
	description: 'Get the raw commodity and overlap amount to update entry',
	usage: '[system name]',
	args: true,
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot admin`);
		}

		let text = '';
		const hotspots = await Hotspot.findAll({ where: {
			system_name: args.join(' '),
		} });
		for (const hotspot of hotspots) {
			text += `Location **${hotspot.body_name}**
Commodity **${hotspot.commodity} x${hotspot.overlaps}**
> Reported at ${hotspot.createdAt.toUTCString()} from ${hotspot.reporter}:
\`\`\`
${prefix}!hotspots update-commodity ${hotspot.id} ${hotspot.commodity} ${hotspot.overlaps}
\`\`\`

`;
		}

		if (!text) {
			return message.channel.send('No hotspots found');
		}

		return message.channel.send(text, { split: true });
	},
};