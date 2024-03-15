export const getRandomsFromArray = <T>(array: T[]): T[] =>
	array.filter(() => {
		const random = Math.floor(Math.random() * 100);

		return random > 75;
	});

export const getRandomFromArray = <T>(array: T[]): T =>
	array[Math.floor(Math.random() * array.length)];
