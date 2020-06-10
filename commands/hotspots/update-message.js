const Hotspot = require('../../database/hotspot');
const HotspotAdmin = require('../../database/hotspot-admin');

module.exports = {
	name: 'update-message',
	args: true,
	usage: '[hotspot id] newline [description]',
	permission: 'hotspot admin',
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });
		if (!admin) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot admin`);
		}

		const messageBody = args.join(' ');
		const separatorIndex = messageBody.indexOf('\n');
		const hotspotID = messageBody.substr(0, separatorIndex);
		const description = messageBody.substr(separatorIndex + 1);

		if (isNaN(hotspotID) || hotspotID <= 0) {
			return message.channel.send('Wrong hotspot id');
		}

		const affectedRows = await Hotspot.update({
			description: description,
		}, {
			where: {
				id: hotspotID,
			},
		});
		if (affectedRows[0] === 0) {
			return message.channel.send('No hotspots found');
		}

		return message.channel.send('Updated');
	},
};
