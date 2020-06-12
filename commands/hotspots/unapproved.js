const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Hotspot = require('../../database2/hotspot');
const HotspotAdmin = require('../../database2/hotspot-admin');

module.exports = {
	name: 'unapproved',
	description: 'List unapproved hotspots',
	async execute(message) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });

		let text = '';
		const hotspots = await Hotspot.findAll({ where: { approver_id: null } });
		for (const hotspot of hotspots) {
			text += `${!hotspot.approver_id && admin ? `> Approval:\n\`${prefix}hotspots approve ${hotspot.id}\`\n\`${prefix}hotspots decline ${hotspot.id}\`\n\n` : ''}Location **${hotspot.body_name}**
Commodity **${hotspot.commodity} x${hotspot.overlaps}**
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
