const OverlapAdmin = require('../../database2/overlap-admin');
const OverlapUser = require('../../database2/overlap-user');

module.exports = {
	name: 'user-add',
	description: 'Add user to report hotspot overlaps',
	args: true,
	usage: '[user]',
	cooldown: 1,
	permission: 'hotspot overlap admin',
	async execute(message) {
		if (!message.mentions.users.size) {
			return message.channel.send('wrong user argument, you need to mention it');
		}

		const mentionUser = message.mentions.users.first();

		const admin = await OverlapAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot overlap admin`);
		}

		const user = await OverlapUser.findOne({ where: { userID: mentionUser.id } });
		if (user) {
			return message.channel.send('This user is already listed');
		}

		await OverlapUser.create({
			userID: mentionUser.id,
			adminID: message.author.id,
		});
		return message.channel.send(`${message.author.username}#${message.author.discriminator} add you ${mentionUser.username}#${mentionUser.discriminator} as hotspot overlap user, you are now able to report hotspots`);
	},
};
