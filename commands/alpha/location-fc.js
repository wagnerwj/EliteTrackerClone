const FleetCarrier = require('../../database/fleetcarrier');

module.exports = {
	name: 'location-fc',
	description: 'Find fleetcarrier in a system',
	args: true,
	usage: '[system name]',
	async execute(message, args) {
		const fleetcarriers = await FleetCarrier.findAll({ where: { star_system: args[0] } });
		if (fleetcarriers.length === 0) {
			return message.channel.send(`No fleetcarrier(s) found in system \`${args[0]}\``);
		}

		let text = '';
		for (const fleetcarrier of fleetcarriers) {
			text += `Fleetcarrier **${fleetcarrier.station_name}**:
Body: ${fleetcarrier.body_name}
`;
			if (fleetcarrier.services) {
				text += 'Services:';
				for (const service of fleetcarrier.services.split('|')) {
					text += '\n- ' + service;
				}
			}

			text += '\n\n';
		}

		return message.channel.send(text, { split: true });
	},
};
