const { prefix } = require(process.env.CONFIG_PATH || '../../../config.json');
const Guild = require('../../../database/guild');
const market = require('../../../market/announcements');

module.exports = {
	name: 'enable',
	description: 'Enable announcements for system state check',
	guildOnly: true,
	args: false,
	admin: true,
	async execute(message, args) {
		const guild = await Guild.findOne({ where: { guildID: message.guild.id } });
		if (!guild) {
			return message.channel.send('Error in bot configuration, remove and add the bot again for proper setup');
		}

		if (guild.marketStateCheckChannel) {
			try {
				await market.checkPermissions(guild.marketStateCheckChannel);
			}
			catch (e) {
				return message.channel.send(`Got \`${e.message}\` on testing permissions for channel <#${guild.marketStateCheckChannel}>, ${message.author}`);
			}
		}

		const affectedRows = await Guild.update({ marketStateCheckEnabled: true }, { where: { guildID: message.guild.id } });
		if (affectedRows < 1) {
			return message.channel.send('Error updating configuration');
		}

		let info = '';
		if (args[0] === 'yes' && !guild.marketStateCheckChannel) {
			info = `\nNo channel configured, use \`${prefix}market announcements channel\` to define the channel for the announcements`;
		}
		await message.channel.send(`System state check announcements are enabled${info}`);
	},
};
