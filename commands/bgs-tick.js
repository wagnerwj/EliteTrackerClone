const bgs = require('../bgs');

module.exports = {
	name: 'bgs-tick',
	description: 'Shows when the last bgs tick happend',
	cooldown: 15,
	async execute(message) {
		const tick = bgs.getTick();
		const date = new Date(tick.time);
		const format = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h24', timeZone: 'UTC', timeZoneName: 'short' });
		message.channel.send(`Last BGS tick happend at ${format.format(date)}`);
	},
};
