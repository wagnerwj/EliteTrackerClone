const { prefix } = require(process.env.CONFIG_PATH || '../../config.json');
const Guild = require('../../database/guild');

module.exports = {
	name: 'help',
	description: 'List all of my hotspot overlap commands or info about a specific hotspot overlap command.',
	aliases: ['commands', 'list'],
	usage: '[command name]',
	cooldown: 1,
	async execute(message, args) {
		const data = [];
		const { hotspotCommands: commands } = message.client;

		let guild;
		if (message.channel.type === 'text') {
			guild = await Guild.findOne({ where: { guild_id: message.channel.guild.id } });
		}

		if (!args.length) {
			data.push('Here\'s a list of all my commands:');
			data.push(commands
				.filter(command => !command.hidden)
				.filter(command => !command.guildOnly || message.channel.type === 'text')
				.filter(command => !command.admin || (guild && message.member.roles.cache.find(r => r.id === guild.admin_role_id)))
				.map(command => `> \`${command.name}\` ${command.shortDescription || command.description}`).join('\n'),
			);
			data.push(`\nYou can send \`${prefix}overlaps help [command name]\` to get info on a specific command!`);

			return message.reply(data, { split: true })
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
				});
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.usage) data.push(`**Usage:** ${prefix}overlaps ${command.name} ${command.usage}`);
		if (command.description) data.push(`**Description:** ${command.description}`);

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		message.channel.send(data, { split: true });
	},
};