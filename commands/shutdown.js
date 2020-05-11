const discord = require('../discord');

module.exports = {
	name: 'shutdown',
	description: 'Shutdown',
	hidden: true,
	async execute(message) {
		await message.reply('shutting down');
		await discord.disconnect();
		process.exit(0);
	},
};
