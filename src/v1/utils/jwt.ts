import type hapiAuthJwt2 from 'hapi-auth-jwt2';
import jwt from 'jsonwebtoken';
import { type AccessToken } from 'src/v1/models';
import { type DataStore } from 'src/v1/store';
import { type UUID } from 'node:crypto';
import { type Request, type ServerStateCookieOptions } from '@hapi/hapi';

export type TokenCreationOptions = {
	userId: UUID;
	payload?: string | Record<string, unknown> | Uint8Array;
	options?: jwt.SignOptions;
};

export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
export const createAccessTokenOptions = (): ServerStateCookieOptions => ({
	isSameSite: process.env.NODE_ENV === 'development' ? 'Lax' : 'None',
	isSecure: process.env.NODE_ENV === 'production',
	domain: process.env.NODE_ENV === 'development' ? 'localhost' : undefined,
	ttl: 1000 * 60 * 5, // 5 minutes
	isHttpOnly: true,
	path: '/',
});

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const createRefreshTokenOptions = (): ServerStateCookieOptions => ({
	isSameSite: process.env.NODE_ENV === 'development' ? 'Lax' : 'None',
	isSecure: process.env.NODE_ENV === 'production',
	domain: process.env.NODE_ENV === 'development' ? 'localhost' : undefined,
	ttl: 1000 * 60 * 60 * 24 * 30, // 1 month
	isHttpOnly: true,
	path: '/',
});

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

export const getRefreshToken = (request: Request) => {
	const authorizationHeader = request.headers.authorization as string;

	if (authorizationHeader) {
		const [_bearerKeyword, refreshTokenFromHeader] =
			authorizationHeader.split(' ');

		return refreshTokenFromHeader || null;
	}

	const refreshTokenFromCookie = request.state[
		REFRESH_TOKEN_COOKIE_NAME
	] as string;

	return refreshTokenFromCookie || null;
};
