const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');

module.exports = {
	name: 'list',
	description: 'Show commands to find hotspot overlaps',
	async execute(message) {
		return message.channel.send(`**Show hotspot overlap statistic**:
\`${prefix}overlaps stats\`

**Show hotspots in a system**:
\`${prefix}overlaps system [system name]\`

**Show hotspots location for a given commodity**:
\`${prefix}overlaps find [commodity]\`

**Show hotspots location for a given commodity with a minimum overlap**:
\`${prefix}overlaps find [commodity] [overlap amount]\`

**Show all unapproved hotspots reports**:
\`${prefix}overlaps status\`
`);
	},
};
