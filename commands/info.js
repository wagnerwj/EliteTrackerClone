const Guild = require('../database2/guild');

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

		const text = `**Configuration**:
Admin role: ${rolename} (${guild.adminRoleID})`;
		message.channel.send(text);
	},
};
