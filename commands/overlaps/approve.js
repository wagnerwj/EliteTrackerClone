const Hotspot = require('../../database2/hotspot');
const HotspotAdmin = require('../../database2/hotspot-admin');

module.exports = {
	name: 'approve',
	description: 'Approve a reported hotspot overlap',
	args: true,
	usage: '[hotspot overlap id]',
	cooldown: 1,
	permission: 'hotspot overlap admin',
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot overlap admin`);
		}

		const affectedRows = await Hotspot.update({ approverID: message.author.id }, { where: { id: +args[0] } });
		if (affectedRows < 1) {
			return message.channel.send('hotspot overlap not found');
		}

		return message.channel.send('Hotspot overlap approved');
	},
};
