const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { genericCommand } = require('../generic');

const commands = new Discord.Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, 'alpha')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(path.join(__dirname, 'alpha', file));
	commands.set(command.name, command);
}

module.exports = {
	name: 'alpha',
	description: 'Commands in alpha state',
	args: true,
	usage: '[command]',
	async execute(message, args) {
		if (!message.client.alphaCommands) {
			message.client.alphaCommands = commands;
		}

		return genericCommand(message, args, commands, ['alpha']);
	},
};
