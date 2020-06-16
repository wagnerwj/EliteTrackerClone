const got = require('got');
const highSell = require('./high-sell');

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

async function getTick() {
	const response = await got('https://elitebgs.app/api/ebgs/v4/ticks', { responseType: 'json' });
	return response.body[0];
}

async function runBGS() {
	const tick = await getTick();
	await highSell.bgsTick(tick.time);
}

module.exports = {
	init: async () => {
		await runBGS();
		start();
	},
	getTick: async () => {
		return getTick();
	},
};
