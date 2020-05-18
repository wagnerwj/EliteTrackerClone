const got = require('got');
const discord = require('./discord');

function start() {
	setInterval(async () => {
		try {
			await runBGS();
		}
		catch (error) {
			console.log(error);
		}
	}, 1000 * 60 * 10);
}

async function runBGS() {
	const response = await got('https://elitebgs.app/api/ebgs/v4/ticks', { responseType: 'json' });
	await discord.bgsTick(response.body[0].time);
}

module.exports = {
	init: async () => {
		await runBGS();
		start();
	},
};
