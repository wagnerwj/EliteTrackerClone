const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { genericCommand } = require('../generic');

const commands = new Discord.Collection();
const commandFolder = 'market';

const commandFiles = fs.readdirSync(path.join(__dirname, commandFolder)).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(path.join(__dirname, commandFolder, file));
	commands.set(command.name, command);
}

module.exports = {
	name: commandFolder,
	description: 'Market commands',
	args: true,
	usage: '[command]',
	cooldown: 1,
	async execute(message, args) {
		if (!message.client.marketCommands) {
			message.client.marketCommands = commands;
		}

		return genericCommand(message, args, commands, ['market']);
	},
};
