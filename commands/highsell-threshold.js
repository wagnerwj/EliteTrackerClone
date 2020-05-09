const Guild = require('../database/guild');
const HighSellThreshold = require('../database/highsell-threshold');

module.exports = {
	name: 'highsell-threshold',
	description: 'Define the threshold to be notified if price is greater or equal',
	guildOnly: true,
	args: true,
	usage: '<material> <minimum sell price>',
	async execute(message, args) {
		if (args.length !== 2 || isNaN(+args[1])) {
			return message.channel.send('wrong arguments');
		}

		const guild = await Guild.findOne({ where: { guild_id: message.guild.id } });
		if (!guild) {
			return message.channel.send('error in bot configuration, remove and add the bot again for proper setup');
		}

		const affectedRows = await HighSellThreshold.update({
			minimum_price: +args[1],
		}, {
			where: {
				guild_id: message.guild.id,
				material: args[0],
			},
		});
		if (affectedRows > 0) {
			return message.channel.send(`Minimum price ${args[1]} for ${args[0]} updated`);
		}

		await HighSellThreshold.create({
			guild_id: message.guild.id,
			material: args[0],
			minimum_price: +args[1],
		});

		return message.channel.send(`Minimum price ${args[1]} for ${args[0]} set`);
	},
};
