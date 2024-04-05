import { dataStore } from 'src/store';
import crypto from 'node:crypto';
import Boom from '@hapi/boom';
import { userService } from './user.service';
import {
	type RegisterData,
	type Login,
	type AccessToken,
	type User,
	type UserWithoutPassword,
} from 'src/models';
import { authRepository } from 'src/repositories';
import {
	createAccessToken,
	createRefreshToken,
	validateRefreshToken,
} from 'src/utils/jwt';
import { TokenExpiredError } from 'jsonwebtoken';

export const authService = {
	login(loginData: Login) {
		const user = authRepository.login(dataStore, loginData);

		if (!user) {
			throw Boom.unauthorized('Invalid email or password');
		}

		const accessToken = createAccessToken(user.id, {});
		const refreshToken = createRefreshToken(user.id, {});

		return { accessToken, refreshToken };
	},

	register(registerData: RegisterData): UserWithoutPassword {
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

		const isRegistered = authRepository.register(dataStore, newUser);

		if (!isRegistered) {
			throw Boom.badRequest('User already exists');
		}

		const { password, ...userWithoutPassword } = newUser;
		return userWithoutPassword;
	},

	refreshToken(refreshToken: string) {
		if (!refreshToken) {
			throw Boom.badRequest('Refresh token is required');
		}

		try {
			const decoded = validateRefreshToken(refreshToken) as AccessToken;
			const newAccessToken = createAccessToken(decoded.sub, {});

			return newAccessToken;
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				throw Boom.unauthorized('Refresh token expired');
			}

			throw Boom.unauthorized('Invalid refresh token');
		}
	},

	me(id: crypto.UUID) {
		if (!id) {
			throw Boom.badRequest('User ID is required');
		}

		const user = userService.getUserById(id);

		if (!user) {
			throw Boom.notFound('User not found');
		}

		return user;
	},
};
