const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const Guild = require('./database/guild');
const HighSellAnnouncement = require('./database/highsell-announcement');
const HighSellThreshold = require('./database/highsell-threshold');
const EmbedHighSell = require('./embeds/highsell');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const highSellMarketCache = {};
async function initHighSellCache() {
	const announcements = await HighSellAnnouncement.findAll();
	if (announcements.length < 1) {
		return;
	}

	for (const announcement of announcements) {
		const guild = await Guild.findOne({ where: { guild_id: announcement.guild_id } });
		if (!guild || !guild.highsell_enabled || !guild.highsell_channel) {
			await HighSellAnnouncement.destroy({ where: {
				guild_id: announcement.guild_id,
				market_id: announcement.market_id,
				material: announcement.material,
			}});
			continue;
		}

		const channel = await client.channels.fetch(guild.highsell_channel);
		const messages = await channel.messages.fetch({around: announcement.message_id, limit: 1});
		const message = messages.first();
		if (message && !message.deleted && message.id === announcement.message_id) {
			if (!highSellMarketCache[announcement.market_id]) {
				highSellMarketCache[announcement.market_id] = {};
			}
			if (!highSellMarketCache[announcement.market_id][announcement.material]) {
				highSellMarketCache[announcement.market_id][announcement.material] = {};
			}

			console.log('found', announcement.market_id, announcement.material, announcement.guild_id);
			highSellMarketCache[announcement.market_id][announcement.material][announcement.guild_id] = {
				message: message,
				highestSellPrice: announcement.highest_sell_price,
				updated: announcement.timestamp,
			};
		}
		else {
			console.log('deleted', announcement.market_id, announcement.material, announcement.guild_id);
			await HighSellAnnouncement.destroy({ where: {
				guild_id: announcement.guild_id,
				market_id: announcement.market_id,
				material: announcement.material,
			}});
		}
	}
}

module.exports = {
	async connect() {
		await client.login(token);
		await initHighSellCache();
	},
	async disconnect() {
		await client.user.setStatus("dnd");
		await client.destroy();
	},
	async checkHighSell(event) {
		const thresholds = await HighSellThreshold.findAll();
		if (thresholds.length < 1) {
			return;
		}

		for (const commodity of event.commodities) {
			for (const threshold of thresholds) {
				if (commodity.name === threshold.material && commodity.sellPrice >= threshold.minimum_price) {
					const guild = await Guild.findOne({ where: { guild_id: threshold.guild_id } });
					if (!guild || !guild.highsell_enabled || !guild.highsell_channel) {
						continue;
					}

					if (!highSellMarketCache[event.marketId]) {
						highSellMarketCache[event.marketId] = {};
					}
					if (!highSellMarketCache[event.marketId][commodity.name]) {
						highSellMarketCache[event.marketId][commodity.name] = {};
					}

					let highestSellPrice = highSellMarketCache[event.marketId][commodity.name][threshold.guild_id] ? highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].highestSellPrice : commodity.sellPrice;
					if (highestSellPrice < commodity.sellPrice) {
						highestSellPrice = commodity.sellPrice;
					}

					const embed = EmbedHighSell.execute({
						commodity: commodity.name,
						system: event.systemName,
						station: event.stationName,
						demand: commodity.demand,
						sellPrice: commodity.sellPrice,
						highestSellPrice: highestSellPrice,
					});

					if (highSellMarketCache[event.marketId][commodity.name][threshold.guild_id]) {
						highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].message.edit(embed);
						highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].highestSellPrice = highestSellPrice;
						highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].updated = Date.now();

						await HighSellAnnouncement.update({
							highest_sell_price: highestSellPrice,
							timestamp: Date.now().toString(),
						}, {
							where: {
								guild_id: threshold.guild_id,
								market_id: event.marketId,
								material: commodity.name,
							},
						});
					}
					else {
						const channel = await client.channels.fetch(guild.highsell_channel)
						const message = await channel.send(embed);
						highSellMarketCache[event.marketId][commodity.name][threshold.guild_id] = {
							message: message,
							highestSellPrice: highestSellPrice,
							updated: Date.now(),
						};

						await HighSellAnnouncement.create({
							guild_id: threshold.guild_id,
							message_id: message.id,
							market_id: event.marketId,
							material: commodity.name,
							highest_sell_price: highestSellPrice,
							timestamp: Date.now(),
						});
					}
				}
				else if (commodity.name === threshold.material && commodity.sellPrice < threshold.minimum_price && highSellMarketCache[event.marketId] && highSellMarketCache[event.marketId][commodity.name] && highSellMarketCache[event.marketId][commodity.name][threshold.guild_id]) {
					highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].message.delete();
					delete highSellMarketCache[event.marketId][commodity.name][threshold.guild_id];

					await HighSellAnnouncement.destroy({ where: {
						guild_id: threshold.guild_id,
						market_id: event.marketId,
						material: commodity.name,
					}});
				}
			}
		}
	},
};

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildCreate', async guild => {
	await Guild.create({
		guild_id: guild.id,
	});
	console.log(`Guild ${guild.id} (${guild.name}) added`);
});
client.on('guildDelete', async guild => {
	await Guild.destroy({ where: { guild_id: guild.id } });
	console.log(`Guild ${guild.id} (${guild.name}) deleted`);
});

client.on('channelDelete', async channel => {
	const guild = await Guild.findOne({ where: { guild_id: channel.guild.id } });
	if (!guild) {
		return;
	}

	if (guild.highsell_channel === channel.id) {
		const affectedRows = await Guild.update({
			highsell_enabled: false,
			highsell_channel: '',
		}, { where: { guild_id: channel.guild.id } });
		if (affectedRows < 1) {
			return console.error('error updating channel delete configuration');
		}
	}
});

client.on('warn', warning => {
	console.warn(warning);
});
client.on('invalidated', () => {
	// EXIT
});


client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}
	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	try {
		await command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});
