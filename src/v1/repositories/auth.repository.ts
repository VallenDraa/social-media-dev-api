import { type Login, type UserWithoutPassword, type User } from 'src/v1/models';
import { type UUID } from 'node:crypto';
import { type DataStore } from 'src/v1/store';

export const authRepository = {
	login(store: DataStore, loginData: Login): UserWithoutPassword | null {
		const { users } = store.getState();
		const user = users.find(
			user =>
				user.email === loginData.email && user.password === loginData.password,
		);

		if (!user) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword;
	},

	register(store: DataStore, user: User) {
		store.setState(state => ({
			...state,
			users: [user, ...state.users],
		}));
	},

	me(store: DataStore, id: UUID) {
		const { users } = store.getState();
		const user = users.find(user => user.id === id);

		if (!user) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword as UserWithoutPassword;
	},
};
