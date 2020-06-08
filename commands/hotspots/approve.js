const Hotspot = require('../../database/hotspot');
const HotspotAdmin = require('../../database/hotspot-admin');

module.exports = {
	name: 'approve',
	description: 'Approve a reported hotspot overlap',
	args: true,
	usage: '[hotspot id]',
	cooldown: 1,
	permission: 'hotspot admin',
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot admin`);
		}

		const affectedRows = await Hotspot.update({ approver_id: message.author.id }, { where: { id: +args[0] } });
		if (affectedRows < 1) {
			return message.channel.send('hotspot not found');
		}

		return message.channel.send('Hotspot approved');
	},
};