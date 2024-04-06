import { type UUID } from 'node:crypto';
import {
	type FriendsList,
	type User,
	type UserWithoutPassword,
	type FriendshipDataDetail,
} from 'src/v1/models';
import { type DataStore } from 'src/v1/store';

export const friendRepository = {
	createFriendsList(store: DataStore, user: User | UserWithoutPassword) {
		store.setState(state => ({
			...state,
			friendsList: [
				{
					userId: user.id,
					list: [],
					createdAt: user.createdAt,
					updatedAt: user.createdAt,
				},
				...state.friendsList,
			],
		}));
	},

	addFriend(store: DataStore, userId: UUID, newFriendId: UUID) {
		let isAdded = false;

		store.setState(state => ({
			...state,
			friendsList: state.friendsList.map(entry => {
				if (entry.userId === userId) {
					const currentDate = new Date().toISOString();
					isAdded = true;

					return {
						...entry,
						updatedAt: currentDate,
						list: [
							{ id: newFriendId, friendsSince: currentDate },
							...entry.list,
						],
					};
				}

				return entry;
			}),
		}));

		return isAdded;
	},

	removeFriend(store: DataStore, userId: UUID, friendId: UUID) {
		let isRemoved = false;

		store.setState(state => ({
			...state,
			friendsList: state.friendsList.map(entry => {
				if (entry.userId === userId) {
					isRemoved = true;

					return {
						...entry,
						updatedAt: new Date().toISOString(),
						list: entry.list.filter(friend => friend.id !== friendId),
					};
				}

				return entry;
			}),
		}));

		return isRemoved;
	},

	getFriends(store: DataStore, userId: UUID) {
		const { friendsList } = store.getState();

		const userFriendsList = friendsList.find(entry => entry.userId === userId);

		return userFriendsList ?? null;
	},

	populateFriendsWithUserData(store: DataStore, friendsList: FriendsList) {
		const { users } = store.getState();

		const results: FriendsList<FriendshipDataDetail> = {
			...friendsList,
			list: [],
		};

		for (const friend of friendsList.list) {
			const user = users.find(user => user.id === friend.id);

			if (!user) {
				return false;
			}

			const { password, ...userWithoutPassword } = user;
			results.list.push({
				user: userWithoutPassword,
				friendsSince: friend.friendsSince,
			});
		}

		return results;
	},
};
