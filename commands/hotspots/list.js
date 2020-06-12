const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');

module.exports = {
	name: 'list',
	description: 'Show commands to find hotspots',
	async execute(message) {
		return message.channel.send(`**Show hotspots statistic**:
\`${prefix}hotspots stats\`

**Show hotspots in a system**:
\`${prefix}hotspots system [system name]\`

**Show hotspots location for a given commodity**:
\`${prefix}hotspots locations [commodity]\`

**Show all unapproved hotspots reports**:
\`${prefix}hotspots unapproved\`
`);
	},
};
