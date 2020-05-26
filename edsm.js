const got = require('got');

module.exports = {
	async stations(systemName) {
		const url = new URL('https://www.edsm.net/api-system-v1/stations');
		if (systemName) {
			url.searchParams.append('systemName', systemName);
		}
		console.log(url.href);
		const response = await got(url.href, { responseType: 'json' });
		console.log(response);
		if (response.id > 0) {
			return response;
		}

		return null;
	},
};
