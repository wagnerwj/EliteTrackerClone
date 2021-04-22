const got = require('got');
const market = require('./market');

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
	const response = await got('https://elitebgs.app/api/ebgs/v5/ticks', { responseType: 'json' });
	return response.body[0];
}

async function runBGS() {
	const tick = await getTick();
	await market.bgsTick(tick.time);
}

module.exports = {
	init: async () => {
		console.log('bgs init start');
		await runBGS();
		console.log('bgs init end');
		start();
	},
	getTick: async () => {
		return getTick();
	},
};
