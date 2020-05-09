const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const Guild = require('./database/guild');
const HighSellThreshold = require('./database/highsell-threshold');
const EmbedHighSell = require('./embeds/highsell');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', async () => {
	await Guild.sync();
	await HighSellThreshold.sync();
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

module.exports = {
	connect() {
		client.login(token);
	},
	async checkHighSell(message) {
		const thresholds = await HighSellThreshold.findAll();
		if (thresholds.length < 1) {
			return;
		}

		for (const commodity of message.commodities) {
			for (const threshold of thresholds) {
				if (commodity.name === threshold.material && commodity.sellPrice >= threshold.minimum_price) {
					const guild = await Guild.findOne({ where: { guild_id: threshold.guild_id } });
					if (!guild || !guild.highsell_enabled || !guild.highsell_channel) {
						continue;
					}

					client.channels.fetch(guild.highsell_channel).then((channel) => {
						channel.send(EmbedHighSell.execute({
							commodity: commodity.name,
							system: message.systemName,
							station: message.stationName,
							demand: commodity.demand,
							sellPrice: commodity.sellPrice,
						}));
					});
				}
			}
		}
	},
};
