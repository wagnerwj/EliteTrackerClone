const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const Guild = require('./database/guild');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', async () => {
	await Guild.sync();
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

client.login(token);

