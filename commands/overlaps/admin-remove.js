const HotspotAdmin = require('../../database2/hotspot-admin');

module.exports = {
	name: 'admin-remove',
	description: 'Remove admin from manage hotspot overlaps',
	args: true,
	owner: true,
	usage: '[user]',
	cooldown: 1,
	async execute(message) {
		if (!message.mentions.users.size) {
			return message.channel.send('wrong user argument, you need to mention it');
		}

		const mentionUser = message.mentions.users.first();

		const admin = await HotspotAdmin.findOne({ where: { adminID: mentionUser.id } });
		if (!admin) {
			return message.channel.send('This user is no admin, can not be removed');
		}

		await HotspotAdmin.destroy({ where: { adminID: mentionUser.id } });
		return message.channel.send(`${message.author.username}#${message.author.discriminator} removed you ${mentionUser.username}#${mentionUser.discriminator} as hotspot overlap admin`);
	},
};
