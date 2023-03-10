const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Overlap = require('../../database/overlap');
const OverlapAdmin = require('../../database/overlap-admin');
const Sequelize = require('sequelize');
const { commoditiesTranslation } = require('./data');
const Op = Sequelize.Op;

module.exports = {
	name: 'system',
	description: 'List all reported hotspots for a system',
	usage: '[system name]',
	args: true,
	async execute(message, args) {
		const admin = await OverlapAdmin.findOne({ where: { adminID: message.author.id } });

		let text = '';
		const hotspots = await Overlap.findAll({ where: {
			approverID: {
				[Op.ne]: null,
			},
			systemName: {
				[Op.iLike]: args.join(' ').replace('%', ''),
			},
		} });
		for (const hotspot of hotspots) {
			text += `${!hotspot.approverID && admin ? `> Approval:\n\`${prefix}overlaps approve ${hotspot.id}\`\n\`${prefix}overlaps decline ${hotspot.id}\`\n\n` : ''}Location **${hotspot.bodyName}**
Commodity **${commoditiesTranslation[hotspot.commodity]} x${hotspot.overlaps}**
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
