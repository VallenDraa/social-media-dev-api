import { type Store, type Post, type Comment, type User } from 'src/models';

export const dataStore: Store<{
	users: User[];
	comments: Comment[];
	posts: Post[];
}> = {
	state: {
		comments: [],
		posts: [],
		users: [],
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

export type DataStore = typeof dataStore;
