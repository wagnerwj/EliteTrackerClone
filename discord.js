const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { prefix, token } = require(process.env.CONFIG_PATH || './config.json');
const Guild = require('./database2/guild');
const HighSellAnnouncement = require('./database/highsell-announcement');
const HighSellThreshold = require('./database/highsell-threshold');
const { init: initMarket } = require('./market');
const { genericCommand } = require('./generic');

const client = new Discord.Client();
client.commands = new Discord.Collection();

function discordReady(c) {
	return new Promise((resolve) => {
		c.once('ready', () => resolve());
	});
}

module.exports = {
	async connect() {
		await Promise.all([
			discordReady(client),
			client.login(token),
		]);
		await initMarket(client);
	},
	async disconnect() {
		await client.user.setStatus('dnd');
		await client.destroy();
	},
};

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(path.join(__dirname, 'commands', file));
	client.commands.set(command.name, command);
}

client.on('guildCreate', async guild => {
	await Guild.create({
		guildID: guild.id,
	});
	console.log(`Guild ${guild.id} (${guild.name}) added`);
});
client.on('guildDelete', async guild => {
	await Guild.destroy({ where: { guildID: guild.id } });
	await HighSellAnnouncement.destroy({ where: { guild_id: guild.id } });
	await HighSellThreshold.destroy({ where: { guild_id: guild.id } });
	console.log(`Guild ${guild.id} (${guild.name}) deleted`);
});

client.on('channelDelete', async channel => {
	const guild = await Guild.findOne({ where: { guildID: channel.guild.id } });
	if (!guild) {
		return;
	}

	if (guild.marketAnnouncementsChannel === channel.id) {
		const affectedRows = await Guild.update({
			marketAnnouncementsEnabled: false,
			marketAnnouncementsChannel: '',
		}, { where: { guildID: channel.guild.id } });
		if (affectedRows < 1) {
			return console.error('error updating channel delete configuration');
		}
	}
});

client.on('warn', warning => {
	console.warn(warning);
});
client.on('invalidated', () => {
	// EXIT
});

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);

	try {
		await genericCommand(message, args, client.commands);
	}
	catch (error) {
		console.error(error);
		await message.reply('there was an error trying to execute that command!');
	}
});
