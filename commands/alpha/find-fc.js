const FleetCarrier = require('../../database/fleetcarrier');

module.exports = {
	name: 'find-fc',
	description: 'Find fleetcarrier and show there location, services and market',
	args: true,
	usage: '[fleetcarrier id]',
	async execute(message, args) {
		const fleetcarrier = await FleetCarrier.findOne({ where: { station_name: args[0] } });
		if (!fleetcarrier) {
			return message.channel.send(`No fleetcarrier found with id \`${args[0]}\``);
		}

		let text = `Fleetcarrier **${fleetcarrier.station_name}**:
System: ${fleetcarrier.star_system}
Body: ${fleetcarrier.body_name}
`;
		if (fleetcarrier.services) {
			text += 'Services:';
			for (const service of fleetcarrier.services.split('|')) {
				text += '\n- ' + service;
			}
		}
		message.channel.send(text);
	},
};
