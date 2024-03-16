import {
	type UserEdit,
	type User,
	type UserCreate,
	type UserWithoutPassword,
} from 'src/models';
import { store } from 'src/store';
import { userRepository } from 'src/repositories';
import Boom from '@hapi/boom';
import { type UUID } from 'crypto';
import { paginateService } from './pagination.service';

export const userService = {
	addUser(newUserData: UserCreate) {
		const createdAt = new Date().toISOString();

		const newUser: User = {
			id: crypto.randomUUID(),
			...newUserData,
			createdAt,
			updatedAt: createdAt,
		};

		const isAdded = userRepository.addUser(store, newUser);

		if (!isAdded) {
			throw Boom.conflict('The username of email of this user already exists!');
		}

		return newUser;
	},

	getUsers(limit = 10, page = 1) {
		const users = userRepository.getUsers(store);

		return paginateService.paginate(users, limit, page);
	},

	getUserById(id: UUID) {
		const user = userRepository.getUserById(store, id);

		if (!user) {
			throw Boom.notFound('User not found!');
		}

		return user;
	},

	updateUser(id: UUID, updatedUserData: UserEdit) {
		const user = this.getUserById(id);

		const updatedUser: UserWithoutPassword = {
			...user,
			...updatedUserData,
			updatedAt: new Date().toISOString(),
		};

		const isUpdated = userRepository.updateUser(store, updatedUser);

		if (!isUpdated) {
			throw Boom.notFound('User not found!');
		}

		return updatedUser;
	},

	updateUserPassword(id: UUID, oldPassword: string, newPassword: string) {
		const user = userRepository.getUserWithPassword(store, id);

		if (!user) {
			throw Boom.notFound('User not found!');
		}

		if (user.password !== oldPassword) {
			throw Boom.badRequest('Current password is incorrect!');
		}

		if (oldPassword === newPassword) {
			throw Boom.badRequest(
				'The new password must be different from the old password!',
			);
		}

		const isUpdated = userRepository.updateUserPassword(store, id, newPassword);

		if (!isUpdated) {
			throw Boom.notFound('User not found!');
		}

		return id;
	},

	deleteUser(id: UUID) {
		const isDeleted = userRepository.deleteUser(store, id);

		if (!isDeleted) {
			throw Boom.notFound('User not found!');
		}

		return id;
	},
};
