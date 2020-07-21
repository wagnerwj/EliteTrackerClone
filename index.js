const Guild = require('./database/guild');
const FleetCarrier = require('./database/fleetcarrier');
const MarketAnnouncementsMessage = require('./database/market-announcement-message');
const MarketAnnouncementsTrigger = require('./database/market-announcement-trigger');
const Overlap = require('./database/overlap');
const OverlapAdmin = require('./database/overlap-admin');
const OverlapUser = require('./database/overlap-user');

const discord = require('./discord');
const bgs = require('./bgs');
const eddn = require('./eddn');

async function start() {
	await Guild.sync();
	await FleetCarrier.sync();
	await MarketAnnouncementsMessage.sync();
	await MarketAnnouncementsTrigger.sync();
	await OverlapAdmin.sync();
	await OverlapUser.sync();
	await Overlap.sync();

	await discord.connect();
	await bgs.init();
	eddn.connect();
}
start();
