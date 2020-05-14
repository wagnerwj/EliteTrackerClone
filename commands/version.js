const fs = require('fs');

const getGitId = async () => {
	const gitId = await fs.readFileSync('.git/HEAD', 'utf8');
	if (gitId.indexOf(':') === -1) {
		return gitId;
	}
	const refPath = '.git/' + gitId.substring(5).trim();
	return fs.readFileSync(refPath, 'utf8');
};

module.exports = {
	name: 'version',
	description: 'Version',
	hidden: true,
	async execute(message) {
		const revision = await getGitId();
		message.reply('My current commit hash is: ' + revision);
	},
};
