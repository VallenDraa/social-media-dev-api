import { type ServerRoute } from '@hapi/hapi';
import { authSwagger } from './auth.swagger';
import { authController } from 'src/v1/controllers';
import { failAction } from 'src/v1/utils/fail-action-response';
import {
	authorizationValidator,
	loginValidator,
	refreshTokenValidator,
	registerValidator,
} from 'src/v1/validators';

export const authRoutes: ServerRoute[] = [
	{
		path: '/auth/register',
		method: 'POST',
		options: {
			auth: false,
			description: 'Register',
			notes: 'Send register data here to upload new user data to the database.',
			tags: ['api', 'auth'],
			validate: {
				failAction,
				payload: registerValidator,
			},
			plugins: { 'hapi-swagger': authSwagger['POST /auth/register'] },
		},
		handler: authController.register,
	},
	{
		path: '/auth/login',
		method: 'POST',
		options: {
			auth: false,
			description: 'Login',
			notes:
				'Send login data here to get access token and refresh token. The access token will expire every 10 minutes, after that you can send a refresh token to get a new access token.',
			tags: ['api', 'auth'],
			plugins: { 'hapi-swagger': authSwagger['POST /auth/login'] },
			validate: {
				failAction,
				payload: loginValidator,
			},
		},
		handler: authController.login,
	},
	{
		path: '/auth/logout',
		method: 'GET',
		options: {
			auth: false,
			description: 'Logout',
			notes: 'Used for clearing refresh token that is stored in the cookies.',
			tags: ['api', 'auth'],
			plugins: { 'hapi-swagger': authSwagger['GET /auth/logout'] },
			validate: { failAction, state: refreshTokenValidator },
		},
		handler: authController.logout,
	},
	{
		path: '/auth/me',
		method: 'GET',
		options: {
			description: 'Me',
			notes:
				'Send an access token here via header or cookies to get the current logged in user detail.',
			tags: ['api', 'auth'],
			plugins: { 'hapi-swagger': authSwagger['GET /auth/me'] },
			validate: {
				failAction,
				headers: authorizationValidator,
			},
		},
		handler: authController.me,
	},
	{
		path: '/auth/refresh-token',
		method: 'GET',
		options: {
			auth: false,
			description:
				'Refresh your access token by sending refresh token via authorization header or cookies',
			notes:
				'Send a refresh token via authorization header or cookies to get new access token.',
			tags: ['api', 'auth'],
			plugins: { 'hapi-swagger': authSwagger['GET /auth/refresh-token'] },
			validate: { failAction, headers: authorizationValidator },
		},
		handler: authController.refreshToken,
	},
];
