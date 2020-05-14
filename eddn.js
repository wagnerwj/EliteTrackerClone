const zlib = require('zlib');
const zmq = require('zeromq');
const discord = require('./discord');
const { eddn } = require(process.env.CONFIG_PATH || './config.json');

const sock = new zmq.Subscriber();
sock.subscribe('');

setTimeout(async () => {
	for await (const [topic] of sock) {
		const message = JSON.parse(zlib.inflateSync(topic));
		if (message['$schemaRef'] === 'https://eddn.edcd.io/schemas/commodity/3') {
			discord.checkHighSell(message.message);
		}
	}
});

module.exports = {
	connect() {
		sock.connect(eddn);
		console.log('EDDN Worker connected');
	},
};
