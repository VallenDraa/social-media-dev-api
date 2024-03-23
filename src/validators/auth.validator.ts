import Joi from 'joi';
import {
	type RegisterData,
	type Login,
	type RefreshTokenPayload,
} from 'src/models';

export const loginValidator = Joi.object<Login, true>({
	email: Joi.string()
		.trim()
		.email()
		.required()
		.messages({ 'any.required': 'Email is invalid or missing' }),
	password: Joi.string().trim().min(8).required().messages({
		'any.required': 'Password is invalid or missing',
	}),
});

export const registerValidator = Joi.object<RegisterData, true>({
	username: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Username is invalid or missing' }),
	email: Joi.string()
		.trim()
		.email()
		.required()
		.messages({ 'any.required': 'Email is invalid or missing' }),
	password: Joi.string().trim().min(8).required().messages({
		'any.required': 'Password is invalid or missing',
	}),
	confirmPassword: Joi.string().trim().min(8).required().messages({
		'any.required': 'Password confirmation is invalid or missing',
	}),
});

export const refreshTokenValidator = Joi.object<RefreshTokenPayload, true>({
	refreshToken: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Refresh	token is invalid or missing' }),
});