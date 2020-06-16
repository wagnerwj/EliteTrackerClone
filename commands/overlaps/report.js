const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const EDSM = require('../../edsm');
const Overlap = require('../../database2/overlap');
const OverlapAdmin = require('../../database2/overlap-admin');
const OverlapUser = require('../../database2/overlap-user');
const { allowedCommodities, commoditiesMap, commoditiesTranslation } = require('./data');

module.exports = {
	name: 'report',
	aliases: ['register'],
	args: true,
	usage: '[Commodity] [Amount of overlaps] [Body] newline [Description, all following text]',
	shortDescription: 'Report a new hotspot overlap',
	description: `Report a new hotspot overlap

**Long commodity names should be shorten**:
- *Low temperature diamonds* use *LTD*
- *Void Opals* use *Vopals*
- *Hafnium 178* use *H178*
- *Lithium Hydroxide* use *LH*
- *Methane Clathrate* use *MC*
- *Methanol Monohydrate* use *MMC*

> in example:
\`\`\`
${prefix}overlaps report LTD 3 Scorpii Sector HR-W c1-34 CD 4
Some text with **formatting??**

And a random borann drop location https://i.imgur.com/mlWVmWL.png

Some other useless picture too https://i.redd.it/p1nzpw570js21.png
\`\`\``,
	permission: 'hotspot overlap user',
	async execute(message, args) {
		const admin = await OverlapAdmin.findOne({ where: { adminID: message.author.id } });
		// const user = await OverlapUser.findOne({ where: { userID: message.author.id } });
		// if (!admin && !user) {
		// 	return message.channel.send(`<@${message.author.id}> you are not a hotspot overlap admin or user, if you want to report hotspots request access from the iMU discord server`);
		// }

		const commodityName = args.shift();
		const overlaps = +args.shift();
		const messageBody = args.join(' ').trim();
		const separatorIndex = messageBody.indexOf('\n');
		const bodyName = (separatorIndex === -1 ? messageBody : messageBody.substr(0, separatorIndex)).trim();
		const description = (separatorIndex === -1 ? '' : messageBody.substr(separatorIndex + 1)).trim();

		const commodity = allowedCommodities.find((c) => c.toLowerCase() === commodityName.toLowerCase());
		if (!commodity) {
			return message.channel.send(`Commodity ${commodityName} is not in the allowed commodity list, ensure it is correctly written`);
		}
		if (isNaN(overlaps) || overlaps <= 0) {
			return message.channel.send('Number of overlaps needed to be greater than 0');
		}
		const inGameCommodity = commoditiesMap[commodity];

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

		const simplifiedBodyName = bodyName.replace(/ /g, '').toLowerCase();
		for (const body of systemBodies.bodies) {
			if (body.name.replace(/ /g, '').toLowerCase() !== simplifiedBodyName) {
				continue;
			}

			let descriptionWithAttachments = description;
			message.attachments.forEach(attachment => {
				descriptionWithAttachments += '\n' + attachment.url;
			});

			await Overlap.create({
				systemName: systemBodies.name,
				systemID64: systemBodies.id64,
				bodyName: body.name,
				commodity: inGameCommodity,
				overlaps: overlaps,
				reporter: `${message.author.username}#${message.author.discriminator}`,
				reporterID: message.author.id,
				approverID: (admin ? admin.adminID : undefined),
				description: descriptionWithAttachments,
			});

			return message.channel.send(`Registered new ${commoditiesTranslation[inGameCommodity]} x${overlaps} hotspot overlap in system ${systemBodies.url} for body \`${body.name}\``);
		}

		return message.channel.send(`No body named ${bodyName} found in ${systemBodies.url}`);
	},
};
