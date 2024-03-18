import { store } from 'src/store';
import { type UUID } from 'crypto';
import Boom from '@hapi/boom';
import { userService } from './user.service';
import {
	type RegisterData,
	type Login,
	type Register,
} from 'src/models/auth.model';
import { type User } from 'src/models';
import { authRepository } from 'src/repositories/auth.repository';
import { createAccessToken } from 'src/utils/jwt';

export const authService = {
	login(loginData: Login) {
		const user = authRepository.login(store, loginData);

		if (!user) {
			throw Boom.unauthorized('Invalid email or password');
		}

		const token = createAccessToken({ sub: user.id });
		return token;
	},

	register(registerData: RegisterData) {
		if (registerData.password !== registerData.confirmPassword) {
			throw Boom.badRequest('Password and confirm password do not match');
		}

		const { confirmPassword, ...dataWithoutConfirmPassword } = registerData;
		const createdAt = new Date().toISOString();

		const newUser: User = {
			id: crypto.randomUUID(),
			...dataWithoutConfirmPassword,
			profilePicture: `https://ui-avatars.com/api/?name=${registerData.username
				.split(' ')
				.join('+')}&background=random`,
			createdAt,
			updatedAt: createdAt,
		};

		const isRegistered = authRepository.register(store, newUser);

		if (!isRegistered) {
			throw Boom.badRequest('User already exists');
		}
	},

	me(id: UUID) {
		const user = userService.getUserById(id);

		if (!user) {
			throw Boom.notFound('User not found');
		}

		return user;
	},
};
