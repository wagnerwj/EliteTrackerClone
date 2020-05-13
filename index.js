const Guild = require('./database/guild');
const HighSellAnnouncement = require('./database/highsell-announcement');
const HighSellThreshold = require('./database/highsell-threshold');
const discord = require('./discord');
const eddn = require('./eddn');

async function start() {
	await Guild.sync();
	await HighSellAnnouncement.sync();
	await HighSellThreshold.sync();

	await discord.connect();
	eddn.connect();
}
start();




