const Hotspot = require('../database/hotspot');
const Hotspot2 = require('../database2/hotspot');
const HotspotUser = require('../database/hotspot-user');
const HotspotUser2 = require('../database2/hotspot-user');
const HotspotAdmin = require('../database/hotspot-admin');
const HotspotAdmin2 = require('../database2/hotspot-admin');

module.exports = {
	name: 'migrate',
	description: 'migrate data',
	guildOnly: true,
	cooldown: 30,
	owner: true,
	hidden: true,
	async execute(message) {
		let count = 0;

		const hotspots = await Hotspot.findAll();
		for (const hotspot of hotspots) {
			await Hotspot2.create({
				systemName: hotspot.system_name,
				systemID64: hotspot.system_id64,
				bodyName: hotspot.body_name,
				commodity: hotspot.commodity,
				overlaps: hotspot.overlaps,
				reporter: hotspot.reporter,
				reporterID: hotspot.reporter_id,
				approverID: hotspot.approver_id,
				description: hotspot.description,
			});
			count++;
		}
		await message.channel.send(`Migrate ${count} hotspots`);
		count = 0;

		const hotspotUsers = await HotspotUser.findAll();
		for (const hotspotUser of hotspotUsers) {
			await HotspotUser2.create({
				userID: hotspotUser.userID,
				adminID: hotspotUser.adminID,
			});
			count++;
		}
		await message.channel.send(`Migrate ${count} users`);
		count = 0;

		const hotspotAdmins = await HotspotAdmin.findAll();
		for (const hotspotAdmin of hotspotAdmins) {
			await HotspotAdmin2.create({
				adminID: hotspotAdmin.adminID,
			});
			count++;
		}
		await message.channel.send(`Migrate ${count} users`);
		count = 0;
	},
};
