import { seedStoreInit } from 'src/v1/store/seed-store';

/**
 * Refresh and randomize the store every interval
 * @param interval The interval to refresh the store
 * @returns A function to stop the interval
 */
export function refreshStore(interval: number) {
	if (interval === 0) {
		throw new Error('Interval cannot be 0');
	}

	const intervalTimer = setInterval(seedStoreInit, interval);

	return () => {
		clearInterval(intervalTimer);
	};
}
