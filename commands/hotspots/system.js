const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Hotspot = require('../../database/hotspot');
const HotspotAdmin = require('../../database/hotspot-admin');

module.exports = {
	name: 'system',
	description: 'List all reported hotspots for a system',
	args: true,
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });

		let text = '';
		const hotspots = await Hotspot.findAll({ where: {
			system_name: args.join(' '),
		} });
		for (const hotspot of hotspots) {
			text += `${!hotspot.approver_id && admin ? `> Approval:\n\`${prefix}hotspots approve ${hotspot.id}\`\n\n` : ''}Location **${hotspot.body_name}**
Commdity **${hotspot.commodity}${hotspot.overlaps}**
> Reported at ${hotspot.createdAt.toUTCString()} from ${hotspot.reporter}:
${hotspot.description}

`;
		}

		if (!text) {
			return message.channel.send('No hotspots found');
		}

		return message.channel.send(text, { split: true });
	},
};
