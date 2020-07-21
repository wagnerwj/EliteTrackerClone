const Overlap = require('../../database/overlap');
const OverlapAdmin = require('../../database/overlap-admin');

module.exports = {
	name: 'decline',
	description: 'Decline a reported hotspot overlap',
	args: true,
	usage: '[hotspot overlap id]',
	cooldown: 1,
	permission: 'hotspot admin',
	async execute(message, args) {
		const admin = await OverlapAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot overlap admin`);
		}

		const affectedRows = await Overlap.destroy({ where: { id: +args[0] } });
		if (affectedRows < 1) {
			return message.channel.send('Hotspot overlap not found');
		}

		return message.channel.send('Hotspot overlap declined');
	},
};
