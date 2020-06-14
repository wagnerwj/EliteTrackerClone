const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Hotspot = require('../../database2/hotspot');
const HotspotAdmin = require('../../database2/hotspot-admin');

module.exports = {
	name: 'unapproved',
	description: 'List unapproved hotspot overlaps',
	async execute(message) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });

		let text = '';
		const hotspots = await Hotspot.findAll({ where: { approverID: null } });
		for (const hotspot of hotspots) {
			text += `${!hotspot.approverID && admin ? `> Approval:\n\`${prefix}overlaps approve ${hotspot.id}\`\n\`${prefix}overlaps decline ${hotspot.id}\`\n\n` : ''}Location **${hotspot.bodyName}**
Commodity **${hotspot.commodity} x${hotspot.overlaps}**
> Reported at ${hotspot.createdAt.toUTCString()} from ${hotspot.reporter}:
${hotspot.description}

`;
		}

		if (!text) {
			return message.channel.send('No hotspot overlaps found');
		}

		return message.channel.send(text, { split: true });
	},
};
