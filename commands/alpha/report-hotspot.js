const EDSM = require('../../edsm');
const Hotspot = require('../../database/hotspot');

module.exports = {
	name: 'report-hotspot',
	description: 'Report a new hotspot',
	args: true,
	owner: true,
	usage: '',
	async execute(message, args) {
		const messageBody = args.join(' ');
		const separatorIndex = messageBody.indexOf('\n');
		const bodyName = messageBody.substr(0, separatorIndex);
		const description = messageBody.substr(separatorIndex + 1);

		const bodySplit = bodyName.split(' ');
		let systemBodies;
		for (let i = 0; i <= bodySplit.length; i++) {
			bodySplit.pop();
			systemBodies = await EDSM.bodies(bodySplit.join(' '));
			if (systemBodies !== null) {
				break;
			}
		}

		if (systemBodies === null) {
			return message.channel.send(`No system for body ${bodyName} found`);
		}

		for (const body of systemBodies.bodies) {
			if (body.name.toLowerCase() !== bodyName.toLowerCase()) {
				continue;
			}

			await Hotspot.create({
				system_name: systemBodies.name,
				system_id64: systemBodies.id64,
				body_name: body.name,
				reporter: `${message.author.username}#${message.author.discriminator}`,
				reporter_id: message.author.id,
				description: description,
			});

			return message.channel.send(`Registered new hotspot in system ${systemBodies.url} for body \`${body.name}\``);
		}

		return message.channel.send(`No body named ${bodyName} found in [${systemBodies.name}](${systemBodies.url})`);
	},
};
