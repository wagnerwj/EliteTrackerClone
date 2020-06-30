const Guild = require('./database/guild');
const HighSellAnnouncement = require('./database/highsell-announcement');
const HighSellThreshold = require('./database/highsell-threshold');

const Guild2 = require('./database2/guild');
const FleetCarrier = require('./database2/fleetcarrier');
const MarketAnnouncementsMessage = require('./database2/market-announcement-message');
const MarketAnnouncementsTrigger = require('./database2/market-announcement-trigger');
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

	await Guild2.sync();
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
