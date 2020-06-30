const { genericHelp } = require('../../generic');

module.exports = {
	name: 'help',
	description: 'List all of my hotspot overlap commands or info about a specific hotspot overlap command.',
	aliases: ['commands', 'list'],
	usage: '[command name]',
	cooldown: 1,
	async execute(message, args) {
		const { overlapCommands: commands } = message.client;

		return genericHelp(message, args, commands, ['overlaps']);
	},
};
