import { type UUID } from 'node:crypto';
import { type UserWithoutPassword, type User } from 'src/models';
import { type DataStore } from 'src/store';

export const userRepository = {
	addUser(store: DataStore, user: User) {
		let isAdded = false;
		const { users } = store.getState();

		// Return early if the user already exists
		if (
			users.find(u => u.email === user.email || u.username === user.username)
		) {
			return isAdded;
		}

		isAdded = true;
		store.setState(state => ({
			...state,
			users: [user, ...state.users],
		}));

		return isAdded;
	},

	getUsers: (store: DataStore) =>
		store.getState().users.map(user => {
			const { password, ...userWithoutPassword } = user;

			return userWithoutPassword as UserWithoutPassword;
		}),

	getUserById(store: DataStore, id: UUID) {
		const { users } = store.getState();

		const user = users.find(user => user.id === id);

		if (!user) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword as UserWithoutPassword;
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
		}));

		return isDeleted;
	},
};
