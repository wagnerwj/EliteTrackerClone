const Guild = require('../database/guild');
const MarketAnnouncementMessage = require('../database/market-announcement-message');
const MarketAnnouncementTrigger = require('../database/market-announcement-trigger');

module.exports = {
	name: 'fix',
	description: 'Fix bot configuration',
	guildOnly: true,
	cooldown: 30,
	hidden: true,
	async execute(message) {
		const guild = await Guild.findOne({ where: { guildID: message.channel.guild.id } });
		if (!guild) {
			await Guild.create({
				guildID: message.channel.guild.id,
			});
			await MarketAnnouncementMessage.destroy({ where: {
				guildID: message.channel.guild.id,
			} });
			await MarketAnnouncementTrigger.destroy({ where: {
				guildID: message.channel.guild.id,
			} });
			await message.channel.send('Created missing server configuration');
		}

		await message.channel.send('Fix complete');
	},
};
