import type hapiAuthJwt2 from 'hapi-auth-jwt2';
import jwt from 'jsonwebtoken';
import { type AccessToken } from 'src/models';
import { type DataStore } from 'src/store';
import { type UUID } from 'crypto';

export const createAccessToken = (
	userId: UUID,
	payload: string | Record<string, unknown> | Uint8Array,
	options: jwt.SignOptions = {},
) =>
	jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '10m',
		subject: userId,
		...options,
	});

export const createRefreshToken = (
	userId: UUID,
	payload: string | Record<string, unknown> | Uint8Array,
	options: jwt.SignOptions = {},
) =>
	jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: '182d', // 6 months
		subject: userId,
		...options,
	});

export const validateAccessToken =
	(store: DataStore): hapiAuthJwt2.Options['validate'] =>
	(decoded: AccessToken) => {
		const { users } = store.getState();
		const user = users.find(user => user.id === decoded.sub);

		return { isValid: Boolean(user) };
	};

export const validateRefreshToken = (refreshToken: string) => {
	if (!refreshToken) {
		return null;
	}

	return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
};
