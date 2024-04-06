import {
	type UserEdit,
	type User,
	type UserCreate,
	type UserWithoutPassword,
} from 'src/v1/models';
import { dataStore } from 'src/v1/store';
import { friendRepository, userRepository } from 'src/v1/repositories';
import Boom from '@hapi/boom';
import crypto from 'node:crypto';
import { paginateService } from './pagination.service';

export const userService = {
	addUser(newUserData: UserCreate): UserWithoutPassword {
		const createdAt = new Date().toISOString();

		const newUser: User = {
			id: crypto.randomUUID(),
			...newUserData,
			createdAt,
			updatedAt: createdAt,
		};

		const isAdded = userRepository.addUser(dataStore, newUser);

		if (!isAdded) {
			throw Boom.conflict('The username of email of this user already exists!');
		}

		friendRepository.createFriendsList(dataStore, newUser);

		const { password, ...userWithoutPassword } = newUser;

		return userWithoutPassword;
	},

	getUsers(limit = 10, page = 1) {
		const users = userRepository.getUsers(dataStore);

		return paginateService.paginate(users, limit, page);
	},

	getUserById(id: crypto.UUID) {
		const user = userRepository.getUserById(dataStore, id);

		if (!user) {
			throw Boom.notFound('User not found!');
		}

		return user;
	},

	updateUser(id: crypto.UUID, updatedUserData: UserEdit) {
		const user = this.getUserById(id);

		const updatedUser: UserWithoutPassword = {
			...user,
			...updatedUserData,
			updatedAt: new Date().toISOString(),
		};

		const isUpdated = userRepository.updateUser(dataStore, updatedUser);

		if (!isUpdated) {
			throw Boom.notFound('User not found!');
		}

		return updatedUser;
	},

	updateUserPassword(
		id: crypto.UUID,
		oldPassword: string,
		newPassword: string,
	) {
		const user = userRepository.getUserWithPassword(dataStore, id);

		if (!user) {
			throw Boom.notFound('User not found!');
		}

		if (user.password !== oldPassword) {
			throw Boom.unauthorized('Current password is incorrect!');
		}

		if (oldPassword === newPassword) {
			throw Boom.badRequest(
				'The new password must be different from the old password!',
			);
		}

		const isUpdated = userRepository.updateUserPassword(
			dataStore,
			id,
			newPassword,
		);

		if (!isUpdated) {
			throw Boom.notFound('User not found!');
		}

		return id;
	},

	deleteUser(id: crypto.UUID) {
		const isDeleted = userRepository.deleteUser(dataStore, id);

		if (!isDeleted) {
			throw Boom.notFound('User not found!');
		}

		return id;
	},
};
