import { dataStore, seedStoreInit, refreshStore } from 'src/v1/store';

describe('refreshStore', () => {
	beforeAll(seedStoreInit);

	it('Should throw error if interval is 0', () => {
		expect(() => refreshStore(0)).toThrow('Interval cannot be 0');
	});

	it('Should refresh the store every 2 second', done => {
		const previousState = { ...dataStore.getState() };

		const stopRefreshStore = refreshStore(2000);

		setTimeout(() => {
			stopRefreshStore();

			// Check if the store is refreshed
			const currentState = dataStore.getState();

			for (const key in previousState) {
				if (key in previousState && key in currentState) {
					const prevStateKey = key as keyof typeof previousState;
					const currentStateKey = key as keyof typeof currentState;

					expect(previousState[prevStateKey]).not.toEqual(
						currentState[currentStateKey],
					);
				}
			}

			done();
		}, 2000);
	});
});
