const { prefix } = require(process.env.CONFIG_PATH || '../../../config.json');
const { allowedCommodities, commoditiesMap, commoditiesTranslation } = require('./../../overlaps/data');

module.exports = {
	name: 'trigger-add',
	shortDescription: 'Add a trigger for market announcements',
	description: `Add a trigger for market announcements
Syntax for \`[trigger value]\`:	\`[operator][amount][modifier]\`

Allowed \`[operator]\` values: \`<\`, \`<=\`, \`>\`, \`>=\`
Allowed \`[source]\` values: \`sell\`, \`buy\`

**Examples**:
\`${prefix}market announcements trigger-add sell LTD >1.6mil\`: selling LTDs above 1.6 million
\`${prefix}market announcements trigger-add sell LTD >=1.6mil\`: selling LTDs match or above 1.6 million
\`${prefix}market announcements trigger-add sell Painite >=500k\`: selling painite match or above 500 thousand
\`${prefix}market announcements trigger-add sell Tritium <10k\`: buying tritum match or above 500 thousand`,
	guildOnly: true,
	args: true,
	usage: '[source] [commodity] [trigger value]',
	admin: true,
	async execute(message, args) {
		const source = args.shift();
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

		if (triggerValue.startsWith('>=')) {
			trigger.operator = 'gte';
		}
		else if (triggerValue.startsWith('>')) {
			trigger.operator = 'gt';
		}
		else if (triggerValue.startsWith('<=')) {
			trigger.operator = 'lte';
		}
		else if (triggerValue.startsWith('<')) {
			trigger.operator = 'lt';
		}
		else {
			return message.channel.send(`Unknown operator for trigger value \`${triggerValue}\`, ${message.author}`);
		}


		message.channel.send(`set ${args[0]} for announcements`);
	},
};
