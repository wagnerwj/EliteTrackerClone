const Guild = require('../../../database2/guild');
const market = require('../../../market');

module.exports = {
	name: 'channel',
	description: 'Define a channel for market announcements',
	guildOnly: true,
	args: true,
	usage: '[channel]',
	admin: true,
	async execute(message, args) {
		if (!message.mentions.channels.size) {
			return message.channel.send('Wrong channel argument, you need to mention it');
		}

		try {
			await market.checkPermissions(channel.id);
		}
		catch (e) {
			return message.channel.send(`Got \`${e.message}\` on testing permissions for channel <#${channel.id}>, ${message.author}`);
		}

		const channel = message.mentions.channels.first();
		const affectedRows = await Guild.update({ marketAnnouncementsChannel: channel.id }, { where: { guildID: message.guild.id } });
		if (affectedRows < 1) {
			return message.channel.send('Error updating configuration');
		}

		return message.channel.send(`Set ${args[0]} for announcements`);
	},
};
