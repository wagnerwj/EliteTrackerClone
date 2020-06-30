const { prefix } = require(process.env.CONFIG_PATH || '../../../config.json');
const { allowedCommodities, commoditiesMap, commoditiesTranslation } = require('./../../overlaps/data');
const Trigger = require('../../../database2/market-announcement-trigger');

module.exports = {
	name: 'trigger-add',
	shortDescription: 'Add a trigger for market announcements',
	description: `Add a trigger for market announcements
Syntax for \`[trigger value]\`:	\`[operator][amount][modifier]\`

Allowed \`[operator]\` values: \`<\`, \`<=\`, \`>\`, \`>=\`
Allowed \`[source]\` values: \`sell\`, \`buy\`

**Long commodity names should be shorten**:
- *Low temperature diamonds* use *LTD*
- *Void Opals* use *VOpal*
- *Hafnium 178* use *H178*
- *Lithium Hydroxide* use *LH*
- *Methane Clathrate* use *MC*
- *Methanol Monohydrate* use *MMC*

**Examples**:
\`${prefix}market announcements trigger-add sell LTD >1.6mil\`: selling LTDs above 1 600 000
\`${prefix}market announcements trigger-add sell LTD >=1.6mil\`: selling LTDs match or above 1 600 000
\`${prefix}market announcements trigger-add sell Painite >=500k\`: selling painite match or above 500 000
\`${prefix}market announcements trigger-add buy Tritium <10k\`: buying tritum match or below 10 000`,
	guildOnly: true,
	args: true,
	usage: '[source] [commodity] [trigger value]',
	admin: true,
	async execute(message, args) {
		const source = args.shift().toLowerCase();
		const commodityName = args.shift();

		const commodity = allowedCommodities.find((c) => c.toLowerCase() === commodityName.toLowerCase());
		if (!commodity) {
			return message.channel.send(`Commodity ${commodityName} is not known, ensure it is correctly written`);
		}
		const inGameCommodity = commoditiesMap[commodity];

		const trigger = {
			source: source,
			operator: '',
			value: 0,
			commodity: inGameCommodity,
		};

		const triggerValue = args.join('').toLowerCase();
		const valueMatch = triggerValue.match(/(\d+(?:\.\d+)?)/);
		if (!valueMatch) {
			return message.channel.send(`Unknown amount for trigger value \`${triggerValue}\`, ${message.author}`);
		}
		trigger.value = +valueMatch[0];
		if (triggerValue.endsWith('k')) {
			trigger.value *= 1000;
		}
		else if (triggerValue.endsWith('m') || triggerValue.endsWith('mil')) {
			trigger.value *= 1000000;
		}

		console.log(triggerValue);

		let translatedOperator = '';
		if (triggerValue.startsWith('>=')) {
			trigger.operator = 'gte';
			translatedOperator = 'greater than or equal';
		}
		else if (triggerValue.startsWith('>')) {
			trigger.operator = 'gt';
			translatedOperator = 'greater than';
		}
		else if (triggerValue.startsWith('<=')) {
			trigger.operator = 'lte';
			translatedOperator = 'lower than or equal';
		}
		else if (triggerValue.startsWith('<')) {
			trigger.operator = 'lt';
			translatedOperator = 'lower than';
		}
		else {
			return message.channel.send(`Unknown operator for trigger value \`${triggerValue}\`, ${message.author}`);
		}

		const text = `${commoditiesTranslation[inGameCommodity]} when ${source} price is ${translatedOperator} ${trigger.value.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2)}`;

		const affectedRows = await Trigger.update({
			operator: trigger.operator,
			value: trigger.value,
		}, {
			where: {
				guildID: message.guild.id,
				source: trigger.source,
				commodity: inGameCommodity,
			},
		});
		if (affectedRows[0] > 0) {
			return message.channel.send('Change trigger for ' + text);
		}

		await Trigger.create({
			guildID: message.guild.id,
			source: trigger.source,
			commodity: inGameCommodity,
			operator: trigger.operator,
			value: trigger.value,
		});

		return message.channel.send('Setup trigger for ' + text);
	},
};
