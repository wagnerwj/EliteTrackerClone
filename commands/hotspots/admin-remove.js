const HotspotAdmin = require('../../database/hotspot-admin');

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

		const admin = await HotspotAdmin.findOne({ where: { adminID: message.mentions.users.first().id } });
		if (!admin) {
			return message.channel.send('This user is no admin, can not be removed');
		}

		await HotspotAdmin.destroy({ where: { adminID: message.mentions.users.first().id } });
		return message.channel.send(`<@${message.author.id}> removed you <@${message.mentions.users.first().id}> as hotspot admin`);
	},
};
