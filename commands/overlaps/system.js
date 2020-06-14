const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Hotspot = require('../../database2/hotspot');
const HotspotAdmin = require('../../database2/hotspot-admin');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
	name: 'system',
	description: 'List all reported hotspots for a system',
	usage: '[system name]',
	args: true,
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });

		let text = '';
		const hotspots = await Hotspot.findAll({ where: {
			approverID: {
				[Op.ne]: null,
			},
			systemName: args.join(' '),
		} });
		for (const hotspot of hotspots) {
			text += `${!hotspot.approverID && admin ? `> Approval:\n\`${prefix}overlaps approve ${hotspot.id}\`\n\`${prefix}overlaps decline ${hotspot.id}\`\n\n` : ''}Location **${hotspot.bodyName}**
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
