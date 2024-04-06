export const getRandomsFromArray = <T>(array: T[]): T[] =>
	array.filter(() => {
		const random = Math.floor(Math.random() * 100);

		return random > 75;
	});

export const getRandomFromArray = <T>(array: T[]): T =>
	array[Math.floor(Math.random() * array.length)];

export const emptyArray = <T>(length: number, mapEach?: () => T) => {
	const newEmptyArray = [...new Array<T>(length)];

	return mapEach ? newEmptyArray.map(mapEach) : newEmptyArray;
};
