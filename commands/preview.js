module.exports = {
	name: 'preview',
	description: 'Preview message',
	guildOnly: true,
	execute(message, args) {
		if (args.length < 1) {
			message.channel.send('missing preview message name');
			return;
		}

		const highsell = require('../embeds/highsell');
		const embed = highsell.execute({
			commodity: 'lowtemperaturdimand',
			system: 'SHOROTENI',
			station: 'Wescott Settlement',
			demand: 2832,
			sellPrice: 1167293,
		});

		switch (args[0]) {
		case 'high-sell':
			message.channel.send(embed).catch((err) => {
				message.channel.send(':dizzy_face:');
				console.error(err);
			});
		}
	},
};
