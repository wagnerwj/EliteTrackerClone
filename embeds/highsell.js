const Discord = require('discord.js');

module.exports = {
	name: 'highsell',
	execute(values) {
		return new Discord.MessageEmbed()
			.setColor('#fc0000')
			.setTitle('High sell price alert')
			.setDescription(values.commodity)
			.setThumbnail('https://lh3.googleusercontent.com/proxy/T3GLf6i3c3o9bfNgqH1SGOyh4zE_S7knI7jyM2NUDyfJ3GOHhStFbgpAl0Mr22G4Snx1l5YNkNiENpkb7nUSsj9g8HzOMqgJewt-9n0cezs')
			.addFields(
				{ name: 'System', value: values.system, inline: true },
				{ name: 'Station', value: values.station, inline: true },
				{ name: '\u200b', value: '\u200b', inline: false },
				{ name: 'Demand', value: values.demand, inline: true },
				{ name: 'Sell Price', value: values.sellPrice.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), inline: true },
			)
			.setTimestamp();
	},
};
