const { prefix } = require(process.env.CONFIG_PATH || '../config.json');
const Guild = require('../database/guild');
const highSell = require('../high-sell');

module.exports = {
	name: 'highsell-enable',
	description: 'Enable announcements for stations with high selling prices',
	guildOnly: true,
	args: true,
	usage: '<yes|no>',
	admin: true,
	async execute(message, args) {
		const guild = await Guild.findOne({ where: { guild_id: message.guild.id } });
		if (!guild) {
			return message.channel.send('error in bot configuration, remove and add the bot again for proper setup');
		}

		if (args[0] === 'yes' && guild.highsell_channel) {
			try {
				await highSell.checkPermissions(guild.highsell_channel);
			}
			catch (e) {
				return message.channel.send(`Got \`${e.message}\` on testing permissions for channel <#${guild.highsell_channel}>, ${message.author}`);
			}
		}

		const affectedRows = await Guild.update({ highsell_enabled: args[0] === 'yes' }, { where: { guild_id: message.guild.id } });
		if (affectedRows < 1) {
			return message.channel.send('error updating configuration');
		}

		let info = '';
		if (args[0] === 'yes' && !guild.highsell_channel) {
			info = `\nNo channel configured, use \`${prefix}highsell-channel\` to define the channel for the announcements`;
		}
		await message.channel.send(`high selling announcements are ${args[0] === 'yes' ? 'enabled' : 'disabled'}${info}`);
	},
};
