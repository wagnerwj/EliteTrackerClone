const FleetCarrier = require('../../database/fleetcarrier');

module.exports = {
	name: 'find-fc',
	description: 'Find fleetcarrier and show there location, services and market',
	args: true,
	usage: '[fleetcarrier id]',
	async execute(message, args) {
		const fleetcarrier = await FleetCarrier.findOne({ where: { stationName: args[0] } });
		if (!fleetcarrier) {
			return message.channel.send(`No fleetcarrier found with id \`${args[0]}\``);
		}

		let text = `Fleetcarrier **${fleetcarrier.stationName}**:
System: ${fleetcarrier.starSystem}
Body: ${fleetcarrier.bodyName}
`;
		if (fleetcarrier.services) {
			text += 'Services:';
			for (const service of fleetcarrier.services.split('|')) {
				text += '\n- ' + service;
			}
		}

		return message.channel.send(text);
	},
};
