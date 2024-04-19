import type hapiAuthJwt2 from 'hapi-auth-jwt2';
import jwt from 'jsonwebtoken';
import { type AccessToken } from 'src/v1/models';
import { type DataStore } from 'src/v1/store';
import { type UUID } from 'node:crypto';
import { type ServerStateCookieOptions } from '@hapi/hapi';

export type TokenCreationOptions = {
	userId: UUID;
	payload?: string | Record<string, unknown> | Uint8Array;
	options?: jwt.SignOptions;
};

export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
export const ACCESS_TOKEN_COOKIE_OPTIONS: ServerStateCookieOptions = {
	isSameSite: 'None',
	isSecure: process.env.NODE_ENV === 'production',
	ttl: 1000 * 60 * 5, // 5 minutes
	isHttpOnly: true,
};

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const REFRESH_TOKEN_COOKIE_OPTIONS: ServerStateCookieOptions = {
	isSameSite: 'None',
	isSecure: process.env.NODE_ENV === 'production',
	ttl: 1000 * 60 * 60 * 24 * 30, // 1 month
	isHttpOnly: true,
};

export const createAccessToken = ({
	userId,
	payload = {},
	options = {},
}: TokenCreationOptions) =>
	jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '10m',
		subject: userId,
		...options,
	});

export const createRefreshToken = ({
	userId,
	payload = {},
	options = {},
}: TokenCreationOptions) =>
	jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: '30d', // 1 month
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
