const Guild = require('../../../database2/guild');
const highSell = require('../../../high-sell');

module.exports = {
	name: 'channel',
	description: 'Define a channel for market announcements',
	guildOnly: true,
	args: true,
	usage: '[channel]',
	admin: true,
	async execute(message, args) {
		if (!message.mentions.channels.size) {
			return message.channel.send('wrong channel argument, you need to mention it');
		}

		try {
			await highSell.checkPermissions(channel.id);
		}
		catch (e) {
			return message.channel.send(`Got \`${e.message}\` on testing permissions for channel <#${channel.id}>, ${message.author}`);
		}

		const channel = message.mentions.channels.first();
		const affectedRows = await Guild.update({ marketAnnouncementsChannel: channel.id }, { where: { guildID: message.guild.id } });
		if (affectedRows < 1) {
			return message.channel.send('error updating configuration');
		}

		message.channel.send(`set ${args[0]} for announcements`);
	},
};
