const { prefix } = require(process.env.CONFIG_PATH || '../config.json');
const Guild = require('../../../database2/guild');
const highSell = require('../../../high-sell');

module.exports = {
	name: 'enable',
	description: 'Enable announcements for market changes',
	guildOnly: true,
	args: false,
	admin: true,
	async execute(message, args) {
		const guild = await Guild.findOne({ where: { guildID: message.guild.id } });
		if (!guild) {
			return message.channel.send('Error in bot configuration, remove and add the bot again for proper setup');
		}

		if (guild.marketAnnouncementsChannel) {
			try {
				await highSell.checkPermissions(guild.marketAnnouncementsChannel);
			}
			catch (e) {
				return message.channel.send(`Got \`${e.message}\` on testing permissions for channel <#${guild.marketAnnouncementsChannel}>, ${message.author}`);
			}
		}

		const affectedRows = await Guild.update({ marketAnnouncementsEnabled: true }, { where: { guildID: message.guild.id } });
		if (affectedRows < 1) {
			return message.channel.send('Error updating configuration');
		}

		let info = '';
		if (args[0] === 'yes' && !guild.marketAnnouncementsChannel) {
			info = `\nNo channel configured, use \`${prefix}highsell-channel\` to define the channel for the announcements`;
		}
		await message.channel.send(`Market announcements are enabled${info}`);
	},
};
