const Guild = require('./database2/guild');
const HighSellAnnouncement = require('./database/highsell-announcement');
const AnnouncementTrigger = require('./database2/market-announcement-trigger');
const EmbedHighSell = require('./embeds/highsell');
const EDSM = require('./edsm');

const highSellMarketCache = {};
const marketStationInfo = {};
let discordClient;

async function checkPermissions(channelID) {
	const channel = await discordClient.channels.fetch(channelID);
	const message = await channel.send('TEST create permission');
	await message.edit('TEST update permission');
	await message.delete();
}

async function disableHighSell(guildID) {
	console.log(`Disabled highsell for guild id (${guildID})`);
	await Guild.update({ marketAnnouncementsEnabled: false }, { where: { guildID: guildID } });
}

async function init(client) {
	discordClient = client;

	const announcements = await HighSellAnnouncement.findAll();
	if (announcements.length < 1) {
		return;
	}

	for (const announcement of announcements) {
		const guild = await Guild.findOne({ where: { guildID: announcement.guild_id } });
		if (!guild || !guild.marketAnnouncementsEnabled || !guild.marketAnnouncementsChannel) {
			await HighSellAnnouncement.destroy({ where: {
				guild_id: announcement.guild_id,
				market_id: announcement.market_id,
				material: announcement.material,
			} });
			continue;
		}

		const channel = await discordClient.channels.fetch(guild.marketAnnouncementsChannel);
		const messages = await channel.messages.fetch({ around: announcement.message_id, limit: 1 });
		const message = messages.first();
		if (message && !message.deleted && message.id === announcement.message_id) {
			if (!highSellMarketCache[announcement.market_id]) {
				highSellMarketCache[announcement.market_id] = {};
			}
			if (!highSellMarketCache[announcement.market_id][announcement.material]) {
				highSellMarketCache[announcement.market_id][announcement.material] = {};
			}

			console.log('found', announcement.market_id, announcement.material, announcement.guild_id);
			highSellMarketCache[announcement.market_id][announcement.material][announcement.guild_id] = {
				message: message,
				highestSellPrice: announcement.highest_sell_price,
				inserted: new Date(announcement.inserted),
				updated: new Date(announcement.updated),
			};
		}
		else {
			console.log('deleted', announcement.market_id, announcement.material, announcement.guild_id);
			await HighSellAnnouncement.destroy({ where: {
				guild_id: announcement.guild_id,
				market_id: announcement.market_id,
				material: announcement.material,
			} });
		}
	}
}

async function check(event) {
	const timestamp = new Date(event.timestamp);
	if (timestamp < lastKnownBGSTick) return;

	// Ignore fleet carrier market
	if (event.economies && event.economies.some((v) => v.name === 'Carrier')) {
		return;
	}

	const triggers = await AnnouncementTrigger.findAll();
	if (triggers.length < 1) {
		return;
	}

	for (const commodity of event.commodities) {
		for (const trigger of triggers) {
			if (commodity.name !== trigger.commodity) continue;

			if (trigger.source === 'sell') {
				let condition = false;
				if (trigger.operator === 'gte') {
					condition = commodity.sellPrice >= trigger.value;
				}
				else if (trigger.operator === 'gt') {
					condition = commodity.sellPrice > trigger.value;
				}
				else if (trigger.operator === 'lte') {
					condition = commodity.sellPrice <= trigger.value;
				}
				else if (trigger.operator === 'lt') {
					condition = commodity.sellPrice < trigger.value;
				}

				if (condition) {
					console.log('condition match');
				}
			}
			else if (trigger.source === 'buy') {
				let condition = false;
				if (trigger.operator === 'gte') {
					condition = commodity.buyPrice >= trigger.value;
				}
				else if (trigger.operator === 'gt') {
					condition = commodity.buyPrice > trigger.value;
				}
				else if (trigger.operator === 'lte') {
					condition = commodity.buyPrice <= trigger.value;
				}
				else if (trigger.operator === 'lt') {
					condition = commodity.buyPrice < trigger.value;
				}

				if (condition) {
					console.log('condition match');
				}
			}
			/*

			const highestPrice = (
				highSellMarketCache[event.marketId]
				&& highSellMarketCache[event.marketId][commodity.name]
				&& highSellMarketCache[event.marketId][commodity.name][threshold.guild_id]
				&& highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].highestSellPrice > 0
					? highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].highestSellPrice
					: commodity.sellPrice
			);
			if (commodity.name === threshold.material && highestPrice >= threshold.minimum_price) {
				const guild = await Guild.findOne({ where: { guildID: threshold.guild_id } });
				if (!guild || !guild.marketAnnouncementsEnabled || !guild.marketAnnouncementsChannel) {
					continue;
				}

				if (!highSellMarketCache[event.marketId]) {
					highSellMarketCache[event.marketId] = {};
				}
				if (!highSellMarketCache[event.marketId][commodity.name]) {
					highSellMarketCache[event.marketId][commodity.name] = {};
				}

				let highestSellPrice = highSellMarketCache[event.marketId][commodity.name][threshold.guild_id] ? highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].highestSellPrice : commodity.sellPrice;
				if (highestSellPrice < commodity.sellPrice) {
					highestSellPrice = commodity.sellPrice;
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

				const embed = EmbedHighSell.execute({
					commodity: commodity.name,
					systemName: event.systemName,
					stationName: event.stationName,
					demand: commodity.demand,
					sellPrice: commodity.sellPrice,
					highestSellPrice: highestSellPrice,
					station: stationInfo,
				});

				if (highSellMarketCache[event.marketId][commodity.name][threshold.guild_id]) {
					try {
						await highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].message.edit(embed);
					}
					catch (e) {
						console.warn(`error updating high sell message for guild ${threshold.guild_id}: ${e}`);
						if (e.message && (e.message === 'Missing Access' || e.message === 'Missing Permissions')) {
							await disableHighSell(threshold.guild_id);
						}
					}

					highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].highestSellPrice = highestSellPrice;
					highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].updated = timestamp;

					await HighSellAnnouncement.update({
						highest_sell_price: highestSellPrice,
						updated: event.timestamp,
					}, {
						where: {
							guild_id: threshold.guild_id,
							market_id: event.marketId,
							material: commodity.name,
						},
					});
				}
				else {
					try {
						const channel = await discordClient.channels.fetch(guild.marketAnnouncementsChannel);
						const message = await channel.send(embed);
						highSellMarketCache[event.marketId][commodity.name][threshold.guild_id] = {
							message: message,
							highestSellPrice: highestSellPrice,
							inserted: timestamp,
							updated: timestamp,
						};

						await HighSellAnnouncement.create({
							guild_id: threshold.guild_id,
							message_id: message.id,
							market_id: event.marketId,
							material: commodity.name,
							highest_sell_price: highestSellPrice,
							inserted: event.timestamp,
							updated: event.timestamp,
						});
					}
					catch (e) {
						console.warn(`error creating high sell message for guild ${threshold.guild_id}: ${e}`);
						if (e.message && (e.message === 'Missing Access' || e.message === 'Missing Permissions')) {
							await disableHighSell(threshold.guild_id);
						}
					}
				}
			}
			else if (commodity.name === threshold.material && commodity.sellPrice < threshold.minimum_price && highSellMarketCache[event.marketId] && highSellMarketCache[event.marketId][commodity.name] && highSellMarketCache[event.marketId][commodity.name][threshold.guild_id]) {
				try {
					await highSellMarketCache[event.marketId][commodity.name][threshold.guild_id].message.delete();
				}
				catch (e) {
					console.warn(`error deleting high sell message for guild ${threshold.guild_id}: ${e}`);
					if (e.message && (e.message === 'Missing Access' || e.message === 'Missing Permissions')) {
						await disableHighSell(threshold.guild_id);
					}
				}

				delete highSellMarketCache[event.marketId][commodity.name][threshold.guild_id];

				await HighSellAnnouncement.destroy({ where: {
					guild_id: threshold.guild_id,
					market_id: event.marketId,
					material: commodity.name,
				} });
			}

			 */
		}
	}
}

async function bgsTick(time) {
	lastKnownBGSTick = new Date(time);
	for (const marketId in highSellMarketCache) {
		for (const commodity in highSellMarketCache[marketId]) {
			for (const guildId in highSellMarketCache[marketId][commodity]) {
				if (highSellMarketCache[marketId][commodity][guildId].inserted < lastKnownBGSTick) {
					await highSellMarketCache[marketId][commodity][guildId].message.delete();
					delete highSellMarketCache[marketId][commodity][guildId];

					await HighSellAnnouncement.destroy({ where: {
						guild_id: guildId,
						market_id: marketId,
						material: commodity,
					} });
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
