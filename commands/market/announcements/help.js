const { genericHelp } = require('../../../generic');

module.exports = {
	name: 'help',
	description: 'List all of my hotspot overlap commands or info about a specific market announcements command.',
	aliases: ['commands', 'list'],
	usage: '[command name]',
	cooldown: 1,
	async execute(message, args) {
		const { marketAnnouncementsCommands: commands } = message.client;

		return genericHelp(message, args, commands, ['market', 'announcements']);
	},
};
