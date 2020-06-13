const FleetCarrier = require('../../database2/fleetcarrier');

module.exports = {
	name: 'location-fc',
	description: 'Find fleetcarrier in a system',
	args: true,
	usage: '[system name]',
	async execute(message, args) {
		const systemName = args.join(' ');
		const fleetcarriers = await FleetCarrier.findAll({ where: { starSystem: systemName } });
		if (fleetcarriers.length === 0) {
			return message.channel.send(`No fleetcarrier(s) found in system \`${systemName}\``);
		}

		let text = '';
		for (const fleetcarrier of fleetcarriers) {
			text += `Fleetcarrier **${fleetcarrier.stationName}**:
Body: ${fleetcarrier.bodyName}
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
