const Discord = require('discord.js');
const { prefix: botPrefix } = require(process.env.CONFIG_PATH || './config.json');
const Guild = require('./database/guild');

const cooldowns = new Discord.Collection();

async function genericHelp(message, args, commands, parentCommands = []) {
	const prefix = parentCommands.join(' ') + (parentCommands.length > 0 ? ' ' : '');

	const data = [];

	let guild;
	if (message.channel.type === 'text') {
		guild = await Guild.findOne({ where: { guildID: message.channel.guild.id } });
	}

	if (!args.length) {
		data.push('Here\'s a list of all my commands:');
		data.push(commands
			.filter(command => !command.hidden)
			.filter(command => !command.guildOnly || message.channel.type === 'text')
			.filter(command => !command.admin || (guild && message.member.roles.cache.find(r => r.id === guild.adminRoleID)))
			.map(command => `> \`${command.name}\` ${command.shortDescription || command.description}`).join('\n'),
		);
		data.push(`\nYou can send \`${botPrefix}${prefix} help [command name]\` to get info on a specific command!`);

		return message.reply(data, { split: true })
			.catch(error => {
				console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
				message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
			});
	}

	const name = args[0].toLowerCase();
	const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

	if (!command) {
		return message.reply('that\'s not a valid command!');
	}

	data.push(`**Name:** ${command.name}`);

	if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
	if (command.usage) data.push(`**Usage:** ${botPrefix}${prefix}${command.name} ${command.usage}`);
	if (command.description) data.push(`**Description:** ${command.description}`);

	data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

	return message.channel.send(data, { split: true });
}

async function genericCommand(message, args, commands, parentCommands = []) {
	const prefix = parentCommands.length > 0 ? parentCommands.join(' ') + ' ' : '';
	const commandName = args.shift().toLowerCase();

	const command = commands.get(commandName)
		|| commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) {
		return message.channel.send(`Command \`${prefix}${commandName}\` does not exist.\nCheck \`${botPrefix}${prefix}help\` for possible commands`);
	}

	const cooldownID = `${prefix}${command.name}`;
	if (!cooldowns.has(cooldownID)) {
		cooldowns.set(cooldownID, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(cooldownID);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${botPrefix}${prefix}${command.name}\` command.`);
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
		const guild = await Guild.findOne({ where: { guildID: message.channel.guild.id } });
		if (!guild) {
			return;
		}

		if (!message.member.roles.cache.find(role => role.id === guild.adminRoleID)) {
			return message.channel.send(`You are not authorized to use this command, ${message.author}!`);
		}
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${botPrefix}${prefix}${command.name} ${command.usage}\`\nOr use \`${botPrefix}${prefix}help\``;
		}

		return message.channel.send(reply);
	}

	await command.execute(message, args);
}
module.exports = {
	genericHelp: genericHelp,
	genericCommand: genericCommand,
};
