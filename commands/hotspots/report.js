const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const EDSM = require('../../edsm');
const Hotspot = require('../../database/hotspot');
const HotspotAdmin = require('../../database/hotspot-admin');
const HotspotUser = require('../../database/hotspot-user');

module.exports = {
	name: 'report',
	description: 'Report a new hotspot overlap',
	args: true,
	usage: `[Body]
[description, all following text]

> in example:
\`\`\`
${prefix}hotspots report Scorpii Sector HR-W c1-34 CD 4
Some text with **formatting??**

And a random borann drop location https://i.imgur.com/mlWVmWL.png

Some other useless picture too https://i.redd.it/p1nzpw570js21.png
\`\`\``,
	permission: 'hotspot user',
	async execute(message, args) {
		const admin = await HotspotAdmin.findOne({ where: { adminID: message.author.id } });
		const user = await HotspotUser.findOne({ where: { userID: message.author.id } });
		if (!admin && !user) {
			return message.channel.send(`<@${message.author.id}> you are not a hotspot admin or user, if you want to report hotspots request access from the iMU discord server`);
		}

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
				approver_id: (admin ? admin.adminID : undefined),
			});

			return message.channel.send(`Registered new hotspot in system ${systemBodies.url} for body \`${body.name}\``);
		}

		return message.channel.send(`No body named ${bodyName} found in ${systemBodies.url}`);
	},
};
