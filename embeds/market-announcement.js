const Discord = require('discord.js');

module.exports = {
	name: 'market-announcement',
	execute(values) {
		let embed = new Discord.MessageEmbed()
			.setTimestamp();

		if (values.source === 'sell') {
			embed = embed.setColor('#fc0000')
				.setAuthor(`High ${values.commodity} sell price`, 'https://fankserver.gitlab.io/elite-dangerous/elitetracker/assets/arrow-up-orange.png', '');
		}
		else if (values.source === 'buy') {
			embed = embed.setColor('#0000fc')
				.setAuthor(`Low ${values.commodity} buy price`, 'https://fankserver.gitlab.io/elite-dangerous/elitetracker/assets/arrow-down-blue.png', '');
		}

		embed = embed.addField('System', values.systemName, true);
		embed = embed.addField('Station', values.stationName, true);
		embed = embed.addField('\u200b', '\u200b', true);

		if (values.source === 'sell') {
			embed = embed.addField('Demand', values.demand.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
			embed = embed.addField('Price', values.price.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
			embed = embed.addField('\u200b', '\u200b', true);
		}
		else {
			embed = embed.addField('Price', values.price.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
			embed = embed.addField('\u200b', '\u200b', true);
			embed = embed.addField('\u200b', '\u200b', true);
		}

		// let tonnage128 = ((-1.08 * 128 / values.demand) + 1.039) * values.price;
		// if (tonnage128 > values.price) {
		// 	tonnage128 = values.price;
		// }
		// let tonnage256 = ((-1.08 * 256 / values.demand) + 1.039) * values.price;
		// if (tonnage256 > values.price) {
		// 	tonnage256 = values.price;
		// }
		// let tonnage512 = ((-1.08 * 512 / values.demand) + 1.039) * values.price;
		// if (tonnage512 > values.price) {
		// 	tonnage512 = values.price;
		// }
		let tonnage128 = values.price;
		if (0.25 * values.demand < 128) {
			tonnage128 = values.price - (1042 * (128 - (0.25 * values.demand)));
		}
		let tonnage256 = values.price;
		if (0.25 * values.demand < 256) {
			tonnage256 = values.price - (1042 * (256 - (0.25 * values.demand)));
		}
		let tonnage512 = values.price;
		if (0.25 * values.demand < 512) {
			tonnage512 = values.price - (1042 * (512 - (0.25 * values.demand)));
		}

		// let tonnageWithoutLoss;
		// for (tonnageWithoutLoss = 1; tonnageWithoutLoss < 1500; tonnageWithoutLoss++) {
		// 	if (0.25 * values.demand < tonnageWithoutLoss) {
		// 		break;
		// 	}
		// }

		if (values.source === 'sell') {
			embed = embed.addField('Sell Price for 128t Cargo', tonnage128.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
			embed = embed.addField('Sell Price for 256t Cargo', tonnage256.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
			embed = embed.addField('Sell Price for 512t Cargo', tonnage512.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2), true);
			embed = embed.addField('\u200b', '\u200b', false);
		}

		if (values.station) {
			const landingPadSize = ['Orbis', 'Coriolis', 'Ocellus', 'Asteroid', 'Planetary Outpost'].some(r => values.station.type.indexOf(r) >= 0) ? 'L' : 'M';
			const isPlanetary = ['Planetary'].some(r => values.station.type.indexOf(r) >= 0);

			embed = embed.setThumbnail(`https://fankserver.gitlab.io/elite-dangerous/elitetracker/assets/stations/${values.station.type.replace(/ /g, '_').toLowerCase()}.png`);

			embed = embed.addField('Distance to star', `${values.station.distanceToArrival.toFixed(2)} ls`, true);
			embed = embed.addField('Landing Pad', `${landingPadSize}${isPlanetary ? ' (Planetary)' : ''}`, true);
			embed = embed.addField('\u200b', '\u200b', true);
			if (values.station.controllingFaction) {
				embed = embed.addField('Faction', values.station.controllingFaction.name, true);
			}
			embed = embed.addField('Black market present', values.station.otherServices.some(r => r === 'Black Market') ? 'Yes' : 'No');
		}

		return embed;
	},
};
