const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Overlap = require('../../database2/overlap');
const OverlapAdmin = require('../../database2/overlap-admin');

module.exports = {
	name: 'status',
	description: 'List unapproved hotspot overlaps',
	alias: ['unapproved'],
	async execute(message) {
		const admin = await OverlapAdmin.findOne({ where: { adminID: message.author.id } });

		let text = '';
		const hotspots = await Overlap.findAll({ where: { approverID: null } });
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
