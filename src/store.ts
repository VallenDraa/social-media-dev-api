export type Store = {
	state: {
		products: string[];
	};

	getState: (
		stateKey: keyof Store['state'],
	) => Store['state'][keyof Store['state']];

	setState: (updater: (state: Store['state']) => Store['state']) => void;

	resetStore: () => void;
};

export const store: Store = {
	state: {
		products: [],
	},

	getState(stateKey) {
		return this.state[stateKey];
	},

	setState(updater) {
		this.state = updater(this.state);
	},

	resetStore() {
		this.state = {
			products: [],
		};
	},
};
