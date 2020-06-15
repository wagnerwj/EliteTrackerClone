const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Overlap = require('../../database2/overlap');
const OverlapAdmin = require('../../database2/overlap-admin');
const { commoditiesTranslation } = require('./data');

module.exports = {
	name: 'get-message',
	description: 'Get the raw messages to update entry',
	usage: '[system name]',
	args: true,
	permission: 'hotspot overlap admin',
	async execute(message, args) {
		const admin = await OverlapAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot overlap admin`);
		}

		let text = '';
		const hotspots = await Overlap.findAll({ where: {
			systemName: args.join(' '),
		} });
		for (const hotspot of hotspots) {
			text += `Location **${hotspot.bodyName}**
Commodity **${commoditiesTranslation[hotspot.commodity]} x${hotspot.overlaps}**
> Reported at ${hotspot.createdAt.toUTCString()} from ${hotspot.reporter}:
\`\`\`
${prefix}overlaps update-message ${hotspot.id}
${hotspot.description}
\`\`\`

`;
		}

		if (!text) {
			return message.channel.send('No hotspot overlaps found');
		}

		return message.channel.send(text, { split: true });
	},
};
