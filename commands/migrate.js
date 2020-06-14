module.exports = {
	name: 'migrate',
	description: 'migrate data',
	guildOnly: true,
	cooldown: 30,
	owner: true,
	hidden: true,
	async execute(message) {
		const count = 0;

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
	},
};
