const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { prefix } = require(process.env.CONFIG_PATH || '../config.json');
const Guild = require('../database/guild');

const commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const commandFolder = 'overlaps';

const commandFiles = fs.readdirSync(path.join(__dirname, commandFolder)).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(path.join(__dirname, commandFolder, file));
	commands.set(command.name, command);
}

module.exports = {
	name: commandFolder,
	aliases: ['overlap'],
	description: 'Hotspot overlaps commands',
	args: true,
	usage: '[command]',
	cooldown: 1,
	async execute(message, args) {
		if (!message.client.overlapCommands) {
			message.client.overlapCommands = commands;
		}

		const commandName = args.shift().toLowerCase();

		const command = message.client.overlapCommands.get(commandName)
			|| message.client.overlapCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) {
			return message.channel.send(`Command \`overlaps ${commandName}\` does not exist.\nCheck \`${prefix}overlaps help\` for possible commands`);
		}

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
				return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`overlaps ${command.name}\` command.`);
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
				reply += `\nThe proper usage would be: \`${prefix}overlaps ${command.name} ${command.usage}\`\nOr use \`${prefix}overlaps help\``;
			}

			return message.channel.send(reply);
		}

		await command.execute(message, args);
	},
};
