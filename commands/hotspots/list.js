const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Hotspot = require('../../database/hotspot');
const HotspotAdmin = require('../../database/hotspot-admin');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
	name: 'list',
	description: 'List all reported hotspots',
	usage: '[unapproved, to show unapproved hotspots]',
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });

		let filter = {};
		let unapproved = false;
		for (const arg of args) {
			if (arg === 'unapproved') {
				unapproved = true;

			}
		}
		if (unapproved) {
			filter['approver_id'] = null;
		}
		else {
			filter = {
				approver_id: {
					[Op.ne]: null,
				},
			};
		}

		let text = '';
		const hotspots = await Hotspot.findAll(filter ? { where: filter } : undefined);
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
