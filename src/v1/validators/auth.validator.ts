import Joi from 'joi';
import {
	type RegisterData,
	type Login,
	type RefreshTokenPayload,
	type AuthorizationPayload,
} from 'src/v1/models';
import crypto from 'node:crypto';

export const loginValidator = Joi.object<Login, true>({
	email: Joi.string()
		.trim()
		.email()
		.required()
		.messages({ 'any.required': 'Email is invalid or missing' })
		.example('john_doe@gmail.com'),
	password: Joi.string()
		.trim()
		.min(8)
		.required()
		.messages({ 'any.required': 'Password is invalid or missing' })
		.example('moreThan8Chars'),
}).label('Login');

export const registerValidator = Joi.object<RegisterData, true>({
	username: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Username is invalid or missing' })
		.example('john_doe'),
	email: Joi.string()
		.trim()
		.email()
		.required()
		.messages({ 'any.required': 'Email is invalid or missing' })
		.example('john_doe@gmail.com'),
	password: Joi.string()
		.trim()
		.min(8)
		.required()
		.messages({ 'any.required': 'Password is invalid or missing' })
		.example('moreThan8Chars'),
	confirmPassword: Joi.string()
		.trim()
		.min(8)
		.required()
		.messages({ 'any.required': 'Password confirmation is invalid or missing' })
		.example('moreThan8Chars'),
}).label('Register');

export const refreshTokenValidator = Joi.object<RefreshTokenPayload, true>({
	refreshToken: Joi.string().trim().required().example(crypto.randomUUID()),
})
	.unknown(true)
	.label('RefreshToken');

export const authorizationValidator = Joi.object<AuthorizationPayload, true>({
	authorization: Joi.string()
		.trim()
		.messages({ 'any.required': 'Authorization token is invalid' }),
})
	.unknown(true)
	.label('AuthorizationHeader');
