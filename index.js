const Guild = require('./database/guild');
const HighSellAnnouncement = require('./database/highsell-announcement');
const HighSellThreshold = require('./database/highsell-threshold');

const FleetCarrier = require('./database2/fleetcarrier');
const Overlap = require('./database2/overlap');
const OverlapAdmin = require('./database2/overlap-admin');
const OverlapUser = require('./database2/overlap-user');

const discord = require('./discord');
const bgs = require('./bgs');
const eddn = require('./eddn');

async function start() {
	await Guild.sync();
	await HighSellAnnouncement.sync();
	await HighSellThreshold.sync();

	await FleetCarrier.sync();
	await OverlapAdmin.sync();
	await OverlapUser.sync();
	await Overlap.sync();

	await discord.connect();
	await bgs.init();
	eddn.connect();
}
start();
