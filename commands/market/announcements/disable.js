const Guild = require('../../../database2/guild');

module.exports = {
	name: 'disable',
	description: 'Disable announcements for market changes',
	guildOnly: true,
	admin: true,
	async execute(message) {
		const guild = await Guild.findOne({ where: { guildID: message.guild.id } });
		if (!guild) {
			return message.channel.send('error in bot configuration, remove and add the bot again for proper setup');
		}

		const affectedRows = await Guild.update({ marketAnnouncementsEnabled: false }, { where: { guildID: message.guild.id } });
		if (affectedRows < 1) {
			return message.channel.send('error updating configuration');
		}

		await message.channel.send('Market announcements are disabled');
	},
};
