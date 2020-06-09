const zlib = require('zlib');
const zmq = require('zeromq');
const discord = require('./discord');
const { eddn } = require(process.env.CONFIG_PATH || './config.json');
const FleetCarrier = require('./database/fleetcarrier');

const sock = new zmq.Subscriber();
sock.subscribe('');

setTimeout(async () => {
	for await (const [topic] of sock) {
		const message = JSON.parse(zlib.inflateSync(topic));
		switch (message['$schemaRef']) {
		case 'https://eddn.edcd.io/schemas/commodity/3':
			await discord.checkHighSell(message.message);
			break;

		case 'https://eddn.edcd.io/schemas/journal/1':
			switch (message['message']['event']) {
			case 'CarrierJump':
				// eslint-disable-next-line no-case-declarations
				const eventMessage = message['message'];
				console.log(`CarrierJump message ${eventMessage['StationName']}`);
				// eslint-disable-next-line no-case-declarations
				const affectedRows = await FleetCarrier.update({
					market_id: eventMessage['MarketID'],
					services: eventMessage['StationServices'].join('|'),

					system_address: eventMessage['SystemAddress'],
					star_system: eventMessage['StarSystem'],
					star_position_x: eventMessage['StarPos'][0],
					star_position_y: eventMessage['StarPos'][1],
					star_position_z: eventMessage['StarPos'][2],
					body_name: eventMessage['Body'],
					body_id: eventMessage['BodyID'],

					updated: new Date(),
				}, {
					where: {
						station_name: eventMessage['StationName'],
					},
				});
				if (affectedRows[0] === 0) {
					await FleetCarrier.create({
						station_name: eventMessage['StationName'],
						market_id: eventMessage['MarketID'],
						services: (eventMessage['StationServices'] || []).join('|'),

						system_address: eventMessage['SystemAddress'],
						star_system: eventMessage['StarSystem'],
						star_position_x: eventMessage['StarPos'][0],
						star_position_y: eventMessage['StarPos'][1],
						star_position_z: eventMessage['StarPos'][2],
						body_name: eventMessage['Body'],
						body_id: eventMessage['BodyID'],

						inserted: new Date(),
					});
				}
				break;
			}
			break;
		}
	}
});

module.exports = {
	connect() {
		sock.connect(eddn);
		console.log('EDDN Worker connected');
	},
};
