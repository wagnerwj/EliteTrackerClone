const Guild = require('../database/guild');
const HighSellThreshold = require('../database/highsell-threshold');

module.exports = {
	name: 'info',
	description: 'Show current configuration',
	guildOnly: true,
	admin: true,
	async execute(message) {
		const guild = await Guild.findOne({ where: { guild_id: message.guild.id } });
		if (!guild) {
			return message.channel.send('error in bot configuration, remove and add the bot again for proper setup');
		}

		let rolename = 'Not found';
		const role = message.guild.roles.cache.find(r => r.id === guild.admin_role_id);
		if (role) {
			rolename = role.name;
		}

		let text = `**Configuration**:
Admin role: ${rolename} (${guild.admin_role_id})

Highsell:
- Enabled: ${guild.highsell_enabled ? 'yes' : 'no'}
- Channel: ${!guild.highsell_channel ? 'n/a' : `<#${guild.highsell_channel}>`}`;

		const thresholds = await HighSellThreshold.findAll({ where: { guild_id: message.guild.id } });
		if (thresholds.length > 0) {
			text += '\n- Thresholds:';
		}
		for (const threshold of thresholds) {
			text += `\n-- ${threshold.material} >=${threshold.minimum_price}`;
		}
		message.channel.send(text);
	},
};
