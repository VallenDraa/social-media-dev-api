import {
	type Store,
	type Post,
	type Comment,
	type User,
	type FriendsList,
} from 'src/v1/models';

export const dataStore: Store<{
	users: User[];
	comments: Comment[];
	posts: Post[];
	friendsList: FriendsList[];
}> = {
	state: {
		comments: [],
		posts: [],
		users: [],
		friendsList: [],
	},

	getState() {
		return this.state;
	},

	setState(updater) {
		this.state = updater(structuredClone(this.state));
	},

	resetStore() {
		this.state = {
			comments: [],
			posts: [],
			users: [],
			friendsList: [],
		};
	},
};

export type DataStore = typeof dataStore;
