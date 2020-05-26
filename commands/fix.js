const Guild = require('../database/guild');
const HighSellAnnouncement = require('../database/highsell-announcement');

module.exports = {
	name: 'fix',
	description: 'Fix bot configuration',
	guildOnly: true,
	cooldown: 30,
	hidden: true,
	async execute(message) {
		try {
			await Guild.findOne({ where: { guild_id: message.channel.guild.id } });
		}
		catch (e) {
			await Guild.create({
				guild_id: message.channel.guild.id,
			});
			await HighSellAnnouncement.destroy({ where: {
				guild_id: message.channel.guild.id,
			} });
			await message.channel.send('Created missing server configuration');
		}

		await message.channel.send('Fix complete');
	},
};
