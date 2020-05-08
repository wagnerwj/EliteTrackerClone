const Guild = require('../database/guild');

module.exports = {
	name: 'info',
	description: 'Show current configuration',
	guildOnly: true,
	async execute(message) {
		const guild = await Guild.findOne({ where: { guild_id: message.guild.id } });
		if (!guild) {
			return message.channel.send('error in bot configuration, remove and add the bot again for proper setup');
		}

		console.log(guild.highsell_channel);

		message.channel.send(`**Configuration**:
Highsell:
- Enabled: ${guild.highsell_enabled ? 'yes' : 'no'}
- Channel: ${!guild.highsell_channel ? 'n/a' : `<#${guild.highsell_channel}>`}`);
	},
};
