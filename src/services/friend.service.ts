import Boom from '@hapi/boom';
import { type UUID } from 'node:crypto';
import { friendRepository, userRepository } from 'src/repositories';
import { dataStore } from 'src/store';
import { paginateService } from './pagination.service';
import {
	type FriendsList,
	type MetaData,
	type FriendshipDataDetail,
} from 'src/models';

export const friendService = {
	addFriend(userId: UUID, newFriendId: UUID) {
		const userFriendsList = friendRepository.getFriends(dataStore, userId);

		if (!userFriendsList) {
			throw Boom.notFound('Cannot find friends list from the given user!');
		}

		const friend = userRepository.getUserById(dataStore, newFriendId);

		if (!friend) {
			throw Boom.notFound('User that is to be a new friend cannot be found!');
		}

		const isAlreadyFriend = userFriendsList.list.some(
			friend => friend.id === newFriendId,
		);

		if (isAlreadyFriend) {
			throw Boom.conflict('This user is already a friend!');
		}

		const isFriendAdded = friendRepository.addFriend(
			dataStore,
			userId,
			newFriendId,
		);

		if (!isFriendAdded) {
			throw Boom.badImplementation('Fail to add friend!');
		}
	},

	removeFriend(userId: UUID, friendId: UUID) {
		const userFriendsList = friendRepository.getFriends(dataStore, userId);

		if (!userFriendsList) {
			throw Boom.notFound('Cannot find friends list from the given user!');
		}

		const friend = userRepository.getUserById(dataStore, friendId);

		if (!friend) {
			throw Boom.notFound('User that is to be unfriended cannot be found!');
		}

		const isAlreadyNotFriend = userFriendsList.list.every(
			friend => friend.id !== friendId,
		);

		if (isAlreadyNotFriend) {
			throw Boom.conflict('This user is already not your friend!');
		}

		const isFriendRemoved = friendRepository.removeFriend(
			dataStore,
			userId,
			friendId,
		);

		if (!isFriendRemoved) {
			throw Boom.badImplementation('Fail to remove friend!');
		}
	},

	getFriends({
		userId,
		limit = 10,
		page = 1,
		withUserData = false,
	}: {
		userId: UUID;
		limit: number;
		page: number;
		withUserData: boolean;
	}) {
		const userFriendsList = friendRepository.getFriends(dataStore, userId);

		if (!userFriendsList) {
			throw Boom.notFound('Cannot find friends list from the given user!');
		}

		if (withUserData) {
			const populatedFriendsList = friendRepository.populateFriendsWithUserData(
				dataStore,
				userFriendsList,
			);

			if (populatedFriendsList === false) {
				throw Boom.badImplementation(
					'Fail to populate friends with user data!',
				);
			}

			const { data, metadata } = paginateService.paginate(
				populatedFriendsList.list,
				limit,
				page,
			);

			const result: {
				friendsList: FriendsList<FriendshipDataDetail>;
				metadata: MetaData;
			} = { friendsList: { ...userFriendsList, list: data }, metadata };

			return result;
		}

		const { data, metadata } = paginateService.paginate(
			userFriendsList.list,
			limit,
			page,
		);

		const result: {
			friendsList: FriendsList;
			metadata: MetaData;
		} = { friendsList: { ...userFriendsList, list: data }, metadata };

		return result;
	},
};
