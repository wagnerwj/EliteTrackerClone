const Guild = require('../database/guild');
const Guild2 = require('../database2/guild');
const Threshold = require('../database/highsell-threshold');
const AnnouncementTrigger = require('../database2/market-announcement-trigger');

module.exports = {
	name: 'migrate',
	description: 'migrate data',
	guildOnly: true,
	cooldown: 30,
	owner: true,
	hidden: true,
	async execute(message) {
		let count = 0;

		// const hotspots = await Hotspot.findAll();
		// for (const hotspot of hotspots) {
		// 	await Hotspot2.create({
		// 		systemName: hotspot.system_name,
		// 		systemID64: hotspot.system_id64,
		// 		bodyName: hotspot.body_name,
		// 		commodity: hotspot.commodity,
		// 		overlaps: hotspot.overlaps,
		// 		reporter: hotspot.reporter,
		// 		reporterID: hotspot.reporter_id,
		// 		approverID: hotspot.approver_id,
		// 		description: hotspot.description,
		// 	});
		// 	count++;
		// }
		// await message.channel.send(`Migrate ${count} hotspots`);
		// count = 0;
		//
		// const OverlapUsers = await OverlapUser.findAll();
		// for (const OverlapUser of OverlapUsers) {
		// 	await OverlapUser2.create({
		// 		userID: OverlapUser.userID,
		// 		adminID: OverlapUser.adminID,
		// 	});
		// 	count++;
		// }
		// await message.channel.send(`Migrate ${count} users`);
		// count = 0;
		//
		// const OverlapAdmins = await OverlapAdmin.findAll();
		// for (const OverlapAdmin of OverlapAdmins) {
		// 	await OverlapAdmin2.create({
		// 		adminID: OverlapAdmin.adminID,
		// 	});
		// 	count++;
		// }
		// await message.channel.send(`Migrate ${count} users`);
		// count = 0;

		// const fcs = await FleetCarrier.findAll();
		// for (const fc of fcs) {
		// 	await FleetCarrier2.create({
		// 		stationName: fc.station_name,
		// 		marketID: fc.market_id,
		// 		services: fc.services,
		// 		systemAddress: fc.system_address,
		// 		starSystem: fc.star_system,
		// 		bodyName: fc.body_name,
		// 		bodyID: fc.body_id,
		// 	});
		// 	count++;
		// }
		// await message.channel.send(`Migrate ${count} fleetcarriers`);
		// count = 0;

		const guilds = await Guild.findAll();
		for (const guild of guilds) {
			await Guild2.create({
				guildID: guild.guild_id,
				adminRoleID: guild.admin_role_id,
				marketAnnouncementsEnabled: guild.highsell_enabled,
				marketAnnouncementsChannel: guild.highsell_channel,
			});
			count++;
		}
		await message.channel.send(`Migrate ${count} guilds`);
		count = 0;

		const thresholds = await Threshold.findAll();
		for (const threshold of thresholds) {
			await AnnouncementTrigger.create({
				guildID: threshold.guild_id,
				source: 'sell',
				commodity: threshold.material,
				operator: 'gte',
				value: threshold.minimum_price,
			});
			count++;
		}
		await message.channel.send(`Migrate ${count} market trigger`);
		count = 0;
	},
};
