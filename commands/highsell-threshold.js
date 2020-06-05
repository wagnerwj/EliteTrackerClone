const Guild = require('../database/guild');
const HighSellThreshold = require('../database/highsell-threshold');

module.exports = {
	name: 'highsell-threshold',
	description: 'Define the threshold to be notified if price is greater or equal',
	guildOnly: true,
	args: true,
	usage: '<material> <minimum sell price>',
	admin: true,
	async execute(message, args) {
		if (args.length !== 2 || isNaN(+args[1])) {
			return message.channel.send('wrong arguments');
		}
		const material = args[0];
		const price = +args[1];

		const guild = await Guild.findOne({ where: { guild_id: message.guild.id } });
		if (!guild) {
			return message.channel.send('error in bot configuration, remove and add the bot again for proper setup');
		}

		if (price > 0) {
			const affectedRows = await HighSellThreshold.update({
				minimum_price: price,
			}, {
				where: {
					guild_id: message.guild.id,
					material: material,
				},
			});
			if (affectedRows > 0) {
				return message.channel.send(`Minimum price ${price.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2)} for ${material} updated`);
			}

			await HighSellThreshold.create({
				guild_id: message.guild.id,
				material: material,
				minimum_price: price,
			});

			return message.channel.send(`Minimum price ${price.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2)} for ${material} set`);
		}
		else {
			await HighSellThreshold.destroy({
				where: {
					guild_id: message.guild.id,
					material: material,
				},
			});

			return message.channel.send(`Deleted ${material}`);
		}
	},
};
