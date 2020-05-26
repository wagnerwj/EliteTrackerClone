const got = require('got');

module.exports = {
	async stations(systemName) {
		const url = new URL('https://www.edsm.net/api-system-v1/stations');
		if (systemName) {
			url.searchParams.append('systemName', systemName);
		}
		const response = await got(url.href, { responseType: 'json' });
		if (response.body.id > 0) {
			return response.body;
		}

		return null;
	},
};
