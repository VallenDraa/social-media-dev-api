import { type UserWithoutPassword, type User } from 'src/models';
import { type Login } from 'src/models/auth.model';
import { type Store } from 'src/store';
import { type UUID } from 'crypto';

export const authRepository = {
	login(store: Store, loginData: Login) {
		const { users } = store.getState();
		const user = users.find(user => user.email === loginData.email);

		if (!user) {
			return null;
		}

		if (user.password !== loginData.password) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword as UserWithoutPassword;
	},

	register(store: Store, user: User) {
		let isRegistered = false;
		const { users } = store.getState();

		// Return early if the user already exists
		if (
			users.find(u => u.email === user.email || u.username === user.username)
		) {
			return isRegistered;
		}

		isRegistered = true;
		store.setState(state => ({
			...state,
			users: [user, ...state.users],
		}));

		return isRegistered;
	},

	me(store: Store, id: UUID) {
		const { users } = store.getState();
		const user = users.find(user => user.id === id);

		if (!user) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword as UserWithoutPassword;
	},
};
