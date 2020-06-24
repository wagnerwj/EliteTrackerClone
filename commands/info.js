const Guild = require('../database2/guild');
const HighSellThreshold = require('../database/highsell-threshold');

module.exports = {
	name: 'info',
	description: 'Show current configuration',
	guildOnly: true,
	admin: true,
	async execute(message) {
		const guild = await Guild.findOne({ where: { guildID: message.guild.id } });
		if (!guild) {
			return message.channel.send('error in bot configuration, remove and add the bot again for proper setup');
		}

		let rolename = 'Not found';
		const role = message.guild.roles.cache.find(r => r.id === guild.adminRoleID);
		if (role) {
			rolename = role.name;
		}

		let text = `**Configuration**:
Admin role: ${rolename} (${guild.adminRoleID})

Highsell:
- Enabled: ${guild.marketAnnouncementsEnabled ? 'yes' : 'no'}
- Channel: ${!guild.marketAnnouncementsChannel ? 'n/a' : `<#${guild.marketAnnouncementsChannel}>`}`;

		const thresholds = await HighSellThreshold.findAll({ where: { guild_id: message.guild.id } });
		if (thresholds.length > 0) {
			text += '\n- Thresholds:';
		}
		for (const threshold of thresholds) {
			text += `\n-- ${threshold.material} >=${threshold.minimum_price.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2)}`;
		}
		message.channel.send(text);
	},
};
