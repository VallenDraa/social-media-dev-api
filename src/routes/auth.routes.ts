import { type ServerRoute } from '@hapi/hapi';
import { authController } from 'src/controllers/auth.controller';
import { failAction } from 'src/utils/fail-action-response';
import {
	loginValidator,
	refreshTokenValidator,
	registerValidator,
} from 'src/validators';

export const authRoutes: ServerRoute[] = [
	{
		path: '/auth/login',
		method: 'POST',
		options: {
			auth: false,
			description: 'Login',
			notes:
				'Send login data here to get access token and refresh token. The access token will expire every 10 minutes, after that you can send a refresh token to get a new access token.',
			tags: ['api'],
			validate: {
				failAction,
				payload: loginValidator,
			},
		},
		handler: authController.login,
	},
	{
		path: '/auth/register',
		method: 'POST',
		options: {
			auth: false,
			description: 'Register',
			notes: 'Send register data here to upload new user data to the database.',
			tags: ['api'],
			validate: {
				failAction,
				payload: registerValidator,
			},
		},
		handler: authController.register,
	},

	{
		path: '/auth/refresh-token',
		method: 'POST',
		options: {
			auth: false,
			description: 'Refresh Token',
			notes: 'Send a refresh token here to get new access token.',
			tags: ['api'],
			validate: {
				failAction,
				payload: refreshTokenValidator,
			},
		},
		handler: authController.refreshToken,
	},
	{
		path: '/auth/me',
		method: 'GET',
		options: {
			description: 'Me',
			notes:
				'Send an access token here to get the current logged in user detail.',
			tags: ['api'],
		},
		handler: authController.me,
	},
];
