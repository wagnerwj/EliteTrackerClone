const { genericHelp } = require('../../generic');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 1,
	async execute(message, args) {
		const { commands } = message.client;

		return genericHelp(message, args, commands, ['overlaps']);
	},
};
