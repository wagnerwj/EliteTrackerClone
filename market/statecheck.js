let lastKnownBGSTick;

async function check(type, event) {
	const timestamp = new Date(event.timestamp);
	if (timestamp < lastKnownBGSTick) return;

	if (!event.Factions) return;

	for (const faction in event.Factions) {
		if (!faction.ActiveStates) continue;

		// check states
	}
}

async function bgsTick(time) {
	lastKnownBGSTick = new Date(time);
}

module.exports = {
	check: check,
	bgsTick: bgsTick,
};
