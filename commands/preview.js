const Discord = require('discord.js');

module.exports = {
	name: 'preview',
	description: 'Preview message',
	execute(message, args) {
		if (args.length < 1) {
			message.channel.send('missing preview message name');
			return;
		}

		switch (args[0]) {
		case "high-sell":
			const highsell = require(`../embeds/highsell`);
			const embed = highsell.execute({

			})
			const embed = new Discord.MessageEmbed()
				.setColor("#fc0000")
				.setTitle("High sell price alert")
				.setDescription("asd")
				//.setAuthor("lowtemperaturdimand alert", "https://lh3.googleusercontent.com/proxy/T3GLf6i3c3o9bfNgqH1SGOyh4zE_S7knI7jyM2NUDyfJ3GOHhStFbgpAl0Mr22G4Snx1l5YNkNiENpkb7nUSsj9g8HzOMqgJewt-9n0cezs", "")
				.setThumbnail("https://lh3.googleusercontent.com/proxy/T3GLf6i3c3o9bfNgqH1SGOyh4zE_S7knI7jyM2NUDyfJ3GOHhStFbgpAl0Mr22G4Snx1l5YNkNiENpkb7nUSsj9g8HzOMqgJewt-9n0cezs")
				.addFields(
					{ name: "System", value: "SHOROTENI", inline: true },
					{ name: "Station", value: "Wescott Settlement", inline: true },
					{ name: "\u200b", value: "\u200b", inline: false },
					{ name: "Demand", value: "2832", inline: true },
					{ name: "Sell Price", value: "1167293", inline: true }
				)
				.setTimestamp();

			message.channel.send(embed).catch((err) => {
				message.channel.send(":dizzy_face:");
				console.error(err);
			});
		}
	},
};
