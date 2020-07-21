const zlib = require('zlib');
const zmq = require('zeromq');
const market = require('./market');
const { eddn } = require(process.env.CONFIG_PATH || './config.json');
const FleetCarrier = require('./database/fleetcarrier');

const sock = new zmq.Subscriber();
sock.subscribe('');

setTimeout(async () => {
	for await (const [topic] of sock) {
		const message = JSON.parse(zlib.inflateSync(topic));
		switch (message['$schemaRef']) {
		case 'https://eddn.edcd.io/schemas/commodity/3':
			await market.check(message.message);
			break;

		case 'https://eddn.edcd.io/schemas/journal/1':
			switch (message['message']['event']) {
			case 'CarrierJump':
				// eslint-disable-next-line no-case-declarations
				const eventMessage = message['message'];
				console.log(`CarrierJump message ${eventMessage['StationName']}`);
				// eslint-disable-next-line no-case-declarations
				const affectedRows = await FleetCarrier.update({
					marketID: eventMessage['MarketID'],
					services: eventMessage['StationServices'].join('|'),
					stationName: eventMessage['StationName'],

					systemAddress: eventMessage['SystemAddress'],
					starSystem: eventMessage['StarSystem'],
					bodyName: eventMessage['Body'],
					bodyID: eventMessage['BodyID'],
				}, {
					where: {
						marketID: eventMessage['MarketID'],
					},
				});
				if (affectedRows[0] === 0) {
					await FleetCarrier.create({
						stationName: eventMessage['StationName'],
						marketID: eventMessage['MarketID'],
						services: (eventMessage['StationServices'] || []).join('|'),

						systemAddress: eventMessage['SystemAddress'],
						starSystem: eventMessage['StarSystem'],
						bodyName: eventMessage['Body'],
						bodyID: eventMessage['BodyID'],
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
