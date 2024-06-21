import { type UUID } from 'node:crypto';
import { type UserWithoutPassword, type User } from 'src/v1/models';
import { type DataStore } from 'src/v1/store';

export const userRepository = {
	addUser(store: DataStore, user: User) {
		store.setState(state => ({ ...state, users: [user, ...state.users] }));
	},

	getUsers(store: DataStore, keyword: string): UserWithoutPassword[] {
		const { users } = store.getState();

		const userResults = users
			.filter(user => user.username.includes(keyword))
			.map(user => {
				const { password, ...userWithoutPassword } = user;

				return userWithoutPassword;
			});

		return userResults;
	},

	getUserById(store: DataStore, id: UUID): UserWithoutPassword | null {
		const { users } = store.getState();

		const user = users.find(user => user.id === id);

		if (!user) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword;
	},

	getUserByUsername(
		store: DataStore,
		username: string,
	): UserWithoutPassword | null {
		const { users } = store.getState();

		const user = users.find(user => user.username === username);

		if (!user) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword;
	},

	isUserExists(
		store: DataStore,
		{
			email,
			username,
		}: { email?: string; username?: string; andOperator?: boolean },
	) {
		const { users } = store.getState();

		return users.some(
			user => user.email === email || user.username === username,
		);
	},

	getUserWithPassword(store: DataStore, id: UUID) {
		const { users } = store.getState();

		const user = users.find(user => user.id === id);

		return user ?? null;
	},

	updateUser(store: DataStore, updatedUser: UserWithoutPassword) {
		let isUpdated = false;

		store.setState(state => ({
			...state,
			users: state.users.map(user => {
				if (user.id === updatedUser.id) {
					isUpdated = true;
					return { ...user, ...updatedUser };
				}

				return user;
			}),
		}));

		return isUpdated;
	},

	updateUserPassword(store: DataStore, id: UUID, newPassword: string) {
		let isUpdated = false;

		store.setState(state => ({
			...state,
			users: state.users.map(user => {
				if (user.id === id) {
					isUpdated = true;
					return { ...user, password: newPassword };
				}

				return user;
			}),
		}));

		return isUpdated;
	},

	deleteUser(store: DataStore, id: UUID) {
		let isDeleted = false;

		store.setState(state => ({
			...state,
			users: state.users.filter(user => {
				if (user.id === id) {
					isDeleted = true;
					return false;
				}

				return true;
			}),
			friendsList: state.friendsList
				// Remove the friendsList that belongs to the deleted user
				.filter(entry => entry.userId !== id)
				// Remove the deleted user from all friendsList that referenced this user
				.map(entry => ({
					...entry,
					list: entry.list.filter(friend => friend.id !== id),
				})),
			comments: state.comments.filter(comment => comment.owner !== id),
			posts: state.posts.filter(post => post.owner !== id),
		}));

		return isDeleted;
	},
};
