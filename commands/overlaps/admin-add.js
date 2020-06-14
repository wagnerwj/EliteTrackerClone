const OverlapAdmin = require('../../database2/overlap-admin');

module.exports = {
	name: 'admin-add',
	description: 'Add admin to manage hotspot overlaps',
	args: true,
	owner: true,
	usage: '[user]',
	cooldown: 1,
	async execute(message) {
		if (!message.mentions.users.size) {
			return message.channel.send('wrong user argument, you need to mention it');
		}

		const mentionUser = message.mentions.users.first();

		const admin = await OverlapAdmin.findOne({ where: { adminID: mentionUser.id } });
		if (admin) {
			return message.channel.send('This user is already an admin');
		}

		await OverlapAdmin.create({
			adminID: mentionUser.id,
		});
		return message.channel.send(`${message.author.username}#${message.author.discriminator} add you ${mentionUser.username}#${mentionUser.discriminator} as hotspot overlap admin`);
	},
};
