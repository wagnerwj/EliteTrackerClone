const Guild = require('./database/guild');
const HighSellAnnouncement = require('./database/highsell-announcement');
const HighSellThreshold = require('./database/highsell-threshold');

const FleetCarrier2 = require('./database2/fleetcarrier');
const Hotspot2 = require('./database2/hotspot');
const HotspotAdmin2 = require('./database2/hotspot-admin');
const HotspotUser2 = require('./database2/hotspot-user');

const discord = require('./discord');
const bgs = require('./bgs');
const eddn = require('./eddn');

async function start() {
	await Guild.sync();
	await HighSellAnnouncement.sync();
	await HighSellThreshold.sync();

	await FleetCarrier2.sync();
	await HotspotAdmin2.sync();
	await HotspotUser2.sync();
	await Hotspot2.sync();

	await discord.connect();
	await bgs.init();
	eddn.connect();
}
start();
