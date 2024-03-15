import { type Comment, type User, type Post } from './models';

export type Store = {
	state: {
		users: User[];
		posts: Post[];
		comments: Comment[];
	};
	getState: () => Store['state'];
	setState: (updater: (state: Store['state']) => Store['state']) => void;
	resetStore: () => void;
};

export const store: Store = {
	state: {
		users: [],
		comments: [],
		posts: [],
	},

	getState() {
		return this.state;
	},

	setState(updater) {
		this.state = updater(structuredClone(this.state));
	},

	resetStore() {
		this.state = {
			users: [],
			comments: [],
			posts: [],
		};
	},
};
