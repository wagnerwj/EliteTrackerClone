const Guild = require('../database/guild');

module.exports = {
	name: 'highsell-channel',
	description: 'Define a channel for the high selling prices announcements',
	guildOnly: true,
	args: true,
	usage: '<channel>',
	async execute(message, args) {
		if (!message.mentions.channels.size) {
			return message.channel.send('wrong channel argument, you need to mention it');
		}

		const channel = message.mentions.channels.first();
		const affectedRows = await Guild.update({ highsell_channel: channel.id }, { where: { guild_id: message.guild.id } });
		if (affectedRows < 1) {
			return message.channel.send('error updating configuration');
		}

		message.channel.send(`set ${args[0]} for announcements`);
	},
};
