const HotspotAdmin = require('../../database/hotspot-admin');
const HotspotUser = require('../../database/hotspot-user');

module.exports = {
	name: 'user-add',
	description: 'Add user to report hotspot overlaps',
	args: true,
	usage: '[user]',
	cooldown: 1,
	permission: 'hotspot admin',
	async execute(message) {
		if (!message.mentions.users.size) {
			return message.channel.send('wrong user argument, you need to mention it');
		}

		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot admin`);
		}

		const user = await HotspotUser.findOne({ where: { userID: message.mentions.users.first().id } });
		if (user) {
			return message.channel.send('This user is already listed');
		}

		await HotspotUser.create({
			userID: message.mentions.users.first().id,
			adminID: message.author.id,
		});
		return message.channel.send(`<@${message.author.id}> add you <@${message.mentions.users.first().id}> as hotspot user, you are now able to report hotspots`);
	},
};
