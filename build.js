const path = require('path');
const { readdir, writeFile } = require('fs').promises;

async function* getFiles(dir) {
	const dirents = await readdir(dir, { withFileTypes: true });
	for (const dirent of dirents) {
		const res = path.resolve(dir, dirent.name);
		if (dirent.isDirectory()) {
			yield* getFiles(res);
		}
		else {
			yield res;
		}
	}
}

(async () => {
	const commands = [];
	const folder = path.join(__dirname, 'commands');
	for await (const f of getFiles(folder)) {
		const commandFilename = f.replace(folder, '');
		const commandFolders = path.dirname(commandFilename).split(path.sep).filter(v => v !== '');
		const command = require(f);

		if (command.hidden) continue;

		commands.push({
			name: (commandFolders.length > 0 ? commandFolders.join(' ') + ' ' : '') + command.name,
			description: command.description,
			args: command.args,
			usage: command.usage,
			guildOnly: command.guildOnly,
			cooldown: command.cooldown,
			admin: command.admin,
		});
	}

	commands.sort((a, b) => {
		if (a.name > b.name) return 1;
		if (a.name < b.name) return -1;
		return 0;
	});

	await writeFile(path.join(__dirname, 'pages', 'src', 'assets', 'commands.json'), JSON.stringify(commands));

	process.exit(0);
})();
