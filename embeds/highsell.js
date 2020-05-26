const Discord = require('discord.js');

module.exports = {
	name: 'highsell',
	execute(values) {
		let embed = new Discord.MessageEmbed()
			.setColor('#fc0000')
			.setTitle(`High ${values.commodity}`)
			// .setThumbnail('https://lh3.googleusercontent.com/proxy/T3GLf6i3c3o9bfNgqH1SGOyh4zE_S7knI7jyM2NUDyfJ3GOHhStFbgpAl0Mr22G4Snx1l5YNkNiENpkb7nUSsj9g8HzOMqgJewt-9n0cezs')
			.setTimestamp();

		embed = embed.addField('System', values.systemName, true);
		embed = embed.addField('Station', values.stationName, true);
		embed = embed.addField('\u200b', '\u200b', true);

		embed = embed.addField('Demand', values.demand.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
		embed = embed.addField('Highest Sell Price', values.highestSellPrice.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
		embed = embed.addField('Latest Reported Sell Price', values.sellPrice.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);

		if (values.station) {
			embed = embed.addField('Distance to star', `${values.station.distanceToArrival.toFixed(2)} ls`, true);
			embed = embed.addField('Landing Pad', (['Orbis', 'Coriolis', 'Ocellus', 'Asteroid'].indexOf(values.station.type) >= 0 ? 'L' : 'M'), true);
			embed = embed.addField('\u200b', '\u200b', true);
			embed = embed.addField('Faction', values.station.controllingFaction.name, true);
		}

		return embed;
	},
};
