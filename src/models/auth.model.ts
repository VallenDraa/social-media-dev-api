import { type UUID } from 'crypto';

export type Login = {
	email: string;
	password: string;
};

export type Register = {
	username: string;
	email: string;
	password: string;
};

export type RegisterData = {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
};

export type AccessToken = {
	sub: UUID;
	iat: number;
	exp: number;
};

export type RefreshTokenPayload = {
	refreshToken: string;
};

export type AuthorizationPayload = {
	authorization: string;
};
