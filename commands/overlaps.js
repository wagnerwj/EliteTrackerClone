const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { genericCommand } = require('../generic');

const commands = new Discord.Collection();
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

		return genericCommand(message, args, commands, ['overlaps']);
	},
};
