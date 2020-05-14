const previewCache = {};

module.exports = {
	name: 'preview',
	description: 'Preview message',
	args: true,
	usage: '<template name|cleanup>',
	guildOnly: true,
	admin: true,
	async execute(message, args) {
		if (args.length < 1) {
			message.channel.send('missing preview message name');
			return;
		}

		const highsell = require('../embeds/highsell');
		const embed = highsell.execute({
			commodity: 'lowtemperaturdimand',
			system: 'SHOROTENI',
			station: 'Wescott Settlement',
			demand: Math.floor(Math.random() * 1000),
			sellPrice: Math.floor(Math.random() * 100000) + 1000000,
		});

		switch (args[0]) {
		case 'high-sell':
			if (previewCache[message.guild.id]) {
				try {
					await previewCache[message.guild.id].edit(embed);
					return;
				}
				catch {
					// send it
				}
			}
			previewCache[message.guild.id] = await message.channel.send(embed);
			break;
		case 'cleanup':
			if (previewCache[message.guild.id]) {
				await previewCache[message.guild.id].delete();
			}
		}
	},
};
