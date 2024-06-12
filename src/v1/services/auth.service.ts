import { dataStore } from 'src/v1/store';
import crypto from 'node:crypto';
import Boom from '@hapi/boom';
import { userService } from './user.service';
import {
	type RegisterData,
	type Login,
	type AccessToken,
	type User,
} from 'src/v1/models';
import {
	authRepository,
	friendRepository,
	userRepository,
} from 'src/v1/repositories';
import {
	createAccessToken,
	createRefreshToken,
	validateRefreshToken,
} from 'src/v1/utils/jwt';
import { TokenExpiredError } from 'jsonwebtoken';

export const authService = {
	login(loginData: Login) {
		const user = authRepository.login(dataStore, loginData);

		if (!user) {
			throw Boom.unauthorized('Invalid email or password');
		}

		return {
			accessToken: createAccessToken({ userId: user.id }),
			refreshToken: createRefreshToken({ userId: user.id }),
		};
	},

	register(registerData: RegisterData) {
		if (registerData.password !== registerData.confirmPassword) {
			throw Boom.badRequest('Password and confirm password do not match');
		}

		if (userRepository.isUserExists(dataStore, registerData)) {
			throw Boom.badRequest('User already exists');
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

		authRepository.register(dataStore, newUser);
		friendRepository.createFriendsList(dataStore, newUser);
	},

	refreshToken(refreshToken: string | null) {
		if (!refreshToken) {
			throw Boom.badRequest('Refresh token is required');
		}

		try {
			const decoded = validateRefreshToken(refreshToken) as AccessToken;
			const newAccessToken = createAccessToken({ userId: decoded.sub });

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
