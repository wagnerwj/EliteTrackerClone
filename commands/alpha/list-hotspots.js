const Hotspot = require('../../database/hotspot');

module.exports = {
	name: 'list-hotspots',
	description: 'List all reported hotspots',
	usage: '',
	cooldown: 60,
	async execute(message) {
		let text = '';
		const hotspots = await Hotspot.findAll();
		for (const hotspot of hotspots) {
			text += `Location **${hotspot.body_name}**
Reported at ${hotspot.createdAt} from ${hotspot.reporter}:
${hotspot.description}

`;
		}

		return message.channel.send(text, { split: true });
	},
};
