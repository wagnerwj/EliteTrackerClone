const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { prefix, token } = require(process.env.CONFIG_PATH || './config.json');
const Guild = require('./database/guild');
const HighSellAnnouncement = require('./database/highsell-announcement');
const HighSellThreshold = require('./database/highsell-threshold');
const { init: initHighSell } = require('./high-sell');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

function discordReady(c) {
	return new Promise((resolve) => {
		c.once('ready', () => resolve());
	});
}

module.exports = {
	async connect() {
		await Promise.all([
			discordReady(client),
			client.login(token),
		]);
		await initHighSell(client);
	},
	async disconnect() {
		await client.user.setStatus('dnd');
		await client.destroy();
	},
};

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(path.join(__dirname, 'commands', file));
	client.commands.set(command.name, command);
}

client.on('guildCreate', async guild => {
	await Guild.create({
		guild_id: guild.id,
	});
	console.log(`Guild ${guild.id} (${guild.name}) added`);
});
client.on('guildDelete', async guild => {
	await Guild.destroy({ where: { guild_id: guild.id } });
	await HighSellAnnouncement.destroy({ where: { guild_id: guild.id } });
	await HighSellThreshold.destroy({ where: { guild_id: guild.id } });
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

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

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

	if (command.owner && message.author.id !== '260922583023747082') {
		return message.channel.send(`Only the owner is authorized to use this command, ${message.author}!`);
	}

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.guildOnly && command.admin) {
		const guild = await Guild.findOne({ where: { guild_id: message.channel.guild.id } });
		if (!guild) {
			return;
		}

		if (!message.member.roles.cache.find(role => role.id === guild.admin_role_id)) {
			return message.channel.send(`You are not authorized to use this command, ${message.author}!`);
		}
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
