const { prefix } = require(process.env.CONFIG_PATH || '../config.json');
const Guild = require('../database/guild');

module.exports = {
	name: 'adminrole',
	description: 'Define a role to access admin commands',
	guildOnly: true,
	args: true,
	usage: '[role mention or name]',
	async execute(message, args) {
		const rolename = args.join(' ');
		let role;
		if (message.mentions.roles.size) {
			role = message.mentions.roles.first();
		}
		if (!role) {
			role = message.guild.roles.cache.find(r => r.name === rolename);
		}
		if (!role) {
			return message.channel.send(`Role ${rolename} not found`);
		}

		const guild = await Guild.findOne({ where: { guildID: message.channel.guild.id } });
		if (!guild) {
			return message.channel.send(`error updating configuration, use \`${prefix}fix\` to fix it`);
		}
		if (guild.adminRoleID && !message.member.roles.cache.find(r => r.id === guild.adminRoleID)) {
			return message.channel.send(`Only admins are allowed to change that, ${message.author}`);
		}

		const affectedRows = await Guild.update({ adminRoleID: role.id }, { where: { guildID: message.guild.id } });
		if (affectedRows < 1) {
			return message.channel.send('error updating configuration');
		}

		return message.channel.send(`Admin role set for ${role.name}`);
	},
};
