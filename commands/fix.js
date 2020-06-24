const Guild = require('../database2/guild');
const HighSellAnnouncement = require('../database/highsell-announcement');

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
			await HighSellAnnouncement.destroy({ where: {
				guild_id: message.channel.guild.id,
			} });
			await message.channel.send('Created missing server configuration');
		}

		await message.channel.send('Fix complete');
	},
};
