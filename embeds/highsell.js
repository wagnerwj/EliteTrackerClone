const Discord = require('discord.js');

module.exports = {
	name: 'highsell',
	execute(values) {
		let embed = new Discord.MessageEmbed()
			.setColor('#fc0000')
			.setAuthor(`High ${values.commodity} sell price`, 'https://fankserver.gitlab.io/elite-dangerous/elitetracker/highsell-icon-small.png', '')
			.setTimestamp();

		embed = embed.addField('System', values.systemName, true);
		embed = embed.addField('Station', values.stationName, true);
		embed = embed.addField('\u200b', '\u200b', true);

		embed = embed.addField('Demand', values.demand.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
		embed = embed.addField('Highest Sell Price', values.highestSellPrice.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
		embed = embed.addField('\u200b', '\u200b', true);

		let tonnage128 = ((-128 / values.demand) + 1.039) * values.highestSellPrice;
		if (tonnage128 > values.highestSellPrice) {
			tonnage128 = values.highestSellPrice;
		}
		let tonnage256 = ((-256 / values.demand) + 1.039) * values.highestSellPrice;
		if (tonnage256 > values.highestSellPrice) {
			tonnage256 = values.highestSellPrice;
		}
		let tonnage512 = ((-512 / values.demand) + 1.039) * values.highestSellPrice;
		if (tonnage512 > values.highestSellPrice) {
			tonnage512 = values.highestSellPrice;
		}
		embed = embed.addField('Sell Price for 128t Cargo', tonnage128.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
		embed = embed.addField('Sell Price for 256t Cargo', tonnage256.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
		embed = embed.addField('Sell Price for 512t Cargo', tonnage512.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);

		embed = embed.addField('\u200b', '\u200b', false);

		if (values.station) {
			const landingPadSize = ['Orbis', 'Coriolis', 'Ocellus', 'Asteroid', 'Planetary Outpost'].some(r => r.indexOf(values.station.type) >= 0) ? 'L' : 'M';
			const isPlanetary = ['Planetary'].some(r => r.indexOf(values.station.type) >= 0);

			embed = embed.addField('Distance to star', `${values.station.distanceToArrival.toFixed(2)} ls`, true);
			embed = embed.addField('Landing Pad', `${landingPadSize}${isPlanetary ? ' (Planetary)' : ''}`, true);
			embed = embed.addField('\u200b', '\u200b', true);
			embed = embed.addField('Faction', values.station.controllingFaction.name, true);
		}

		return embed;
	},
};
