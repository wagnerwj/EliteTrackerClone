const zlib = require('zlib');
const zmq = require('zeromq');
const market = require('./market');
const { eddn } = require(process.env.CONFIG_PATH || './config.json');

const sock = new zmq.Subscriber();
sock.subscribe('');

setTimeout(async () => {
	for await (const [topic] of sock) {
		const message = JSON.parse(zlib.inflateSync(topic));

		switch (message['$schemaRef']) {
		case 'https://eddn.edcd.io/schemas/commodity/3':
			await market.check(message.message);
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
