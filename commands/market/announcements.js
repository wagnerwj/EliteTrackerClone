const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { genericCommand } = require('../../generic');

const commands = new Discord.Collection();
const commandFolder = 'announcements';

const commandFiles = fs.readdirSync(path.join(__dirname, commandFolder)).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(path.join(__dirname, commandFolder, file));
	commands.set(command.name, command);
}

module.exports = {
	name: commandFolder,
	description: 'Market announcements commands',
	args: true,
	usage: '[command]',
	cooldown: 1,
	async execute(message, args) {
		if (!message.client.marketAnnouncementsCommands) {
			message.client.marketAnnouncementsCommands = commands;
		}

		return genericCommand(message, args, commands, ['market', 'announcements']);
	},
};
