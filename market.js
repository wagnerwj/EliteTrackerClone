const Guild = require('./database2/guild');
const AnnouncementMessage = require('./database2/market-announcement-message');
const AnnouncementTrigger = require('./database2/market-announcement-trigger');
const MarketAnnouncement = require('./embeds/market-announcement');
const EDSM = require('./edsm');

const marketAnnouncementsCache = {};
const marketStationInfo = {};
let discordClient;

async function checkPermissions(channelID) {
	const channel = await discordClient.channels.fetch(channelID);
	const message = await channel.send('TEST create permission');
	await message.edit('TEST update permission');
	await message.delete();
}

async function disableMarketAnnouncements(guildID) {
	console.log(`Disabled highsell for guild id (${guildID})`);
	await Guild.update({ marketAnnouncementsEnabled: false }, { where: { guildID: guildID } });
}

async function init(client) {
	discordClient = client;

	const announcementMessages = await AnnouncementMessage.findAll();
	if (announcementMessages.length < 1) {
		return;
	}

	for (const announcementMessage of announcementMessages) {
		const guild = await Guild.findOne({ where: { guildID: announcementMessage.guildID } });
		if (!guild || !guild.marketAnnouncementsEnabled || !guild.marketAnnouncementsChannel) {
			await AnnouncementMessage.destroy({ where: {
				id: announcementMessage.id,
			} });
			continue;
		}

		const channel = await discordClient.channels.fetch(guild.marketAnnouncementsChannel);
		const messages = await channel.messages.fetch({ around: announcementMessage.messageID, limit: 1 });
		const message = messages.first();
		if (message && !message.deleted && message.id === announcementMessage.messageID) {
			if (!marketAnnouncementsCache[announcementMessage.source]) {
				marketAnnouncementsCache[announcementMessage.source] = {};
			}
			if (!marketAnnouncementsCache[announcementMessage.source][announcementMessage.marketID]) {
				marketAnnouncementsCache[announcementMessage.source][announcementMessage.marketID] = {};
			}
			if (!marketAnnouncementsCache[announcementMessage.source][announcementMessage.marketID][announcementMessage.commodity]) {
				marketAnnouncementsCache[announcementMessage.source][announcementMessage.marketID][announcementMessage.commodity] = {};
			}

			console.log('found', announcementMessage.source, announcementMessage.marketID, announcementMessage.commodity, announcementMessage.guildID);
			marketAnnouncementsCache[announcementMessage.source][announcementMessage.marketID][announcementMessage.commodity][announcementMessage.guildID] = {
				message: message,
				price: announcementMessage.price,
				inserted: new Date(announcementMessage.createdAt),
				updated: new Date(announcementMessage.updatedAt),
			};
		}
		else {
			console.log('deleted', announcementMessage.source, announcementMessage.marketID, announcementMessage.commodity, announcementMessage.guildID);
			await AnnouncementMessage.destroy({ where: {
				id: announcementMessage.id,
			} });
		}
	}
}

async function check(event) {
	const timestamp = new Date(event.timestamp);
	if (timestamp < lastKnownBGSTick) return;

	const isFleetCarrier = (
		(event.economies && event.economies.some((v) => v.name === 'Carrier'))
		|| /^\w{3}-\w{3}$/.test(event.stationName)
	);
	// Ignore fleet carrier market
	if (isFleetCarrier) return;

	const triggers = await AnnouncementTrigger.findAll();
	if (triggers.length < 1) {
		return;
	}

	for (const commodity of event.commodities) {
		for (const trigger of triggers) {
			if (commodity.name !== trigger.commodity) continue;

			const cache = (
				marketAnnouncementsCache[trigger.source]
				&& marketAnnouncementsCache[trigger.source][event.marketId]
				&& marketAnnouncementsCache[trigger.source][event.marketId][commodity.name]
				&& marketAnnouncementsCache[trigger.source][event.marketId][commodity.name][trigger.guildID]
					? marketAnnouncementsCache[trigger.source][event.marketId][commodity.name][trigger.guildID]
					: null
			);

			let condition = false;
			let price = 0;
			if (trigger.source === 'sell') {
				if (trigger.operator === 'gte') {
					price = (cache && cache.price > commodity.sellPrice ? cache.price : commodity.sellPrice);
					condition = price >= trigger.value;
				}
				else if (trigger.operator === 'gt') {
					price = (cache && cache.price > commodity.sellPrice ? cache.price : commodity.sellPrice);
					condition = price > trigger.value;
				}
				else if (trigger.operator === 'lte') {
					price = (cache && cache.price < commodity.sellPrice ? cache.price : commodity.sellPrice);
					condition = price <= trigger.value;
				}
				else if (trigger.operator === 'lt') {
					price = (cache && cache.price < commodity.sellPrice ? cache.price : commodity.sellPrice);
					condition = price < trigger.value;
				}
			}
			else if (trigger.source === 'buy') {
				if (trigger.operator === 'gte') {
					price = (cache && cache.price > commodity.buyPrice ? cache.price : commodity.buyPrice);
					condition = commodity.buyPrice >= trigger.value;
				}
				else if (trigger.operator === 'gt') {
					price = (cache && cache.price > commodity.buyPrice ? cache.price : commodity.buyPrice);
					condition = commodity.buyPrice > trigger.value;
				}
				else if (trigger.operator === 'lte') {
					price = (cache && cache.price < commodity.buyPrice ? cache.price : commodity.buyPrice);
					condition = commodity.buyPrice <= trigger.value;
				}
				else if (trigger.operator === 'lt') {
					price = (cache && cache.price < commodity.buyPrice ? cache.price : commodity.buyPrice);
					condition = commodity.buyPrice < trigger.value;
				}
			}

			console.log('condition', condition, trigger.commodity, trigger.source, price, trigger.operator, trigger.value);
			if (condition) {
				const guild = await Guild.findOne({ where: { guildID: trigger.guildID } });
				if (!guild || !guild.marketAnnouncementsEnabled || !guild.marketAnnouncementsChannel) {
					continue;
				}

				if (!marketAnnouncementsCache[trigger.source]) {
					marketAnnouncementsCache[trigger.source] = {};
				}
				if (!marketAnnouncementsCache[trigger.source][event.marketId]) {
					marketAnnouncementsCache[trigger.source][event.marketId] = {};
				}
				if (!marketAnnouncementsCache[trigger.source][event.marketId][commodity.name]) {
					marketAnnouncementsCache[trigger.source][event.marketId][commodity.name] = {};
				}

				let stationInfo;
				if (marketStationInfo[event.marketId]) {
					stationInfo = marketStationInfo[event.marketId];
				}
				else {
					try {
						const system = await EDSM.stations(event.systemName);
						if (system) {
							for (const station of system.stations) {
								if (station.name === event.stationName) {
									stationInfo = station;
									break;
								}
							}

							if (stationInfo) {
								marketStationInfo[event.marketId] = stationInfo;
							}
							else {
								console.error('no station found');
							}
						}
						else {
							console.error('no system found');
						}
					}
					catch (e) {
						console.error('edsm station', e);
					}
				}

				const embed = MarketAnnouncement.execute({
					commodity: commodity.name,
					systemName: event.systemName,
					stationName: event.stationName,
					demand: commodity.demand,
					price: price,
					station: stationInfo,
				});

				if (marketAnnouncementsCache[trigger.source][event.marketId][commodity.name][trigger.guildID]) {
					try {
						await marketAnnouncementsCache[trigger.source][event.marketId][commodity.name][trigger.guildID].message.edit(embed);
					}
					catch (e) {
						console.warn(`error updating high sell message for guild ${trigger.guildID}: ${e}`);
						if (e.message && (e.message === 'Missing Access' || e.message === 'Missing Permissions')) {
							await disableMarketAnnouncements(trigger.guildID);
						}
					}

					marketAnnouncementsCache[trigger.source][event.marketId][commodity.name][trigger.guildID].price = price;
					marketAnnouncementsCache[trigger.source][event.marketId][commodity.name][trigger.guildID].updated = timestamp;

					await AnnouncementMessage.update({
						price: price,
					}, {
						where: {
							guildID: trigger.guildID,
							marketID: event.marketId,
							commodity: commodity.name,
							source: trigger.source,
						},
					});
				}
				else {
					try {
						const channel = await discordClient.channels.fetch(guild.marketAnnouncementsChannel);
						const message = await channel.send(embed);
						marketAnnouncementsCache[trigger.source][event.marketId][commodity.name][trigger.guildID] = {
							message: message,
							price: price,
							inserted: timestamp,
							updated: timestamp,
						};

						await AnnouncementMessage.create({
							guildID: trigger.guildID,
							messageID: message.id,
							marketID: event.marketId,
							commodity: commodity.name,
							source: trigger.source,
							price: price,
						});
					}
					catch (e) {
						console.warn(`error creating high sell message for guild ${trigger.guildID}: ${e}`);
						if (e.message && (e.message === 'Missing Access' || e.message === 'Missing Permissions')) {
							await disableMarketAnnouncements(trigger.guildID);
						}
					}
				}
			}
		}
	}
}

async function bgsTick(time) {
	lastKnownBGSTick = new Date(time);

	for (const source in marketAnnouncementsCache) {
		for (const marketID in marketAnnouncementsCache[source]) {
			for (const commodity in marketAnnouncementsCache[source][marketID]) {
				for (const guildID in marketAnnouncementsCache[source][marketID][commodity]) {
					if (marketAnnouncementsCache[source][marketID][commodity][guildID].inserted < lastKnownBGSTick) {
						await marketAnnouncementsCache[source][marketID][commodity][guildID].message.delete();
						delete marketAnnouncementsCache[source][marketID][commodity][guildID];

						await AnnouncementMessage.destroy({ where: {
							source: source,
							guildID: guildID,
							marketID: marketID,
							material: commodity,
						} });
					}
				}
			}
		}
	}

	for (const marketId in marketStationInfo) {
		delete marketStationInfo[marketId];
	}
}

let lastKnownBGSTick;

module.exports = {
	init: init,
	bgsTick: bgsTick,
	check: check,
	checkPermissions: checkPermissions,
};
