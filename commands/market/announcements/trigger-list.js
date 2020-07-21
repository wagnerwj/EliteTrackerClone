const Trigger = require('../../../database/market-announcement-trigger');

module.exports = {
	name: 'trigger-list',
	description: 'List market announcements triggers',
	guildOnly: true,
	admin: true,
	async execute(message) {
		const triggers = await Trigger.findAll({ where: { guildID: message.guild.id } });
		triggers.sort((a, b) => {
			if (a.commodity > b.commodity) return 1;
			if (a.commodity < b.commodity) return -1;
			return 0;
		});

		let text = '';
		let lastCommodity = '';
		for (const trigger of triggers) {
			if (lastCommodity !== trigger.commodity) {
				lastCommodity = trigger.commodity;

				if (text) text += '\n';
				text += `**${trigger.commodity}**:
`;
			}

			let translatedOperator = '';
			if (trigger.operator === 'gte') {
				translatedOperator = 'greater than or equal';
			}
			else if (trigger.operator === 'gt') {
				translatedOperator = 'greater than';
			}
			else if (trigger.operator === 'lte') {
				translatedOperator = 'lower than or equal';
			}
			else if (trigger.operator === 'lt') {
				translatedOperator = 'lower than';
			}

			text += `- ${trigger.source === 'buy' ? 'Buying' : 'Selling'} ${translatedOperator} ${trigger.value.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2)}
`;
		}

		return message.channel.send(text, { split: true });
	},
};
