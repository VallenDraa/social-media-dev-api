import { faker } from '@faker-js/faker';
import { type PluginSpecificConfiguration } from '@hapi/hapi';
import Joi from 'joi';
import { SWAGGER_SECURITY_DEFINITION } from 'src/constants';
import {
	type UserWithoutPassword,
	type ApiResponse,
	type ErrorApiResponse,
	type ErrorApiResponseWithAttributes,
} from 'src/models';

export const authSwagger: Record<
	| 'POST /auth/register'
	| 'POST /auth/login'
	| 'GET /auth/me'
	| 'POST /auth/refresh-token',
	NonNullable<PluginSpecificConfiguration['hapi-swagger']>
> = {
	'POST /auth/register': {
		responses: {
			'200': {
				description: 'Returns success status.',
				schema: Joi.object<ApiResponse<null>>({
					statusCode: Joi.number().example(201),
					message: Joi.string().example('Registration successful'),
					data: Joi.valid(null).example(null),
				}),
			},
			'400': {
				description: 'Can be because of invalid credentials or duplicate user.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					message: Joi.string().example(
						'Password and confirm password do not match',
					),
					error: Joi.string().example('Bad Request'),
				}),
			},
			'500': {
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(500),
					message: Joi.string().example('An internal server error occurred'),
					error: Joi.string().example('Internal Server Error'),
				}),
			},
		},
		order: 1,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'POST /auth/login': {
		responses: {
			'200': {
				description: 'Returns status code with access token and refresh token.',
				schema: Joi.object<
					ApiResponse<{ accessToken: string; refreshToken: string }>,
					true
				>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Login successful'),
					data: Joi.object({
						accessToken: Joi.string().example('Some JWT Access Token'),
						refreshToken: Joi.string().example('Some JWT Refresh Token'),
					}),
				}),
			},
			'400': {
				description:
					'Happens when there is an invalid field sent from the client.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					message: Joi.string().example('Email is invalid or missing'),
					error: Joi.string().example('Bad Request'),
				}),
			},
			'401': {
				description: 'Happens when email or password is incorrect.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(401),
					message: Joi.string().example('Invalid email or password'),
					error: Joi.string().example('Unauthorized'),
				}),
			},
			'500': {
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(500),
					message: Joi.string().example('An internal server error occurred'),
					error: Joi.string().example('Internal Server Error'),
				}),
			},
		},
		order: 2,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'GET /auth/me': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns user detail.',
				schema: Joi.object<ApiResponse<{ user: UserWithoutPassword }>, true>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example(
						'Successfully get current user details',
					),
					data: Joi.object({
						user: Joi.object({
							id: Joi.string().uuid().example(crypto.randomUUID()),
							profilePicture: Joi.string().example(faker.image.avatar()),
							username: Joi.string().example(faker.internet.userName()),
							email: Joi.string().email().example(faker.internet.email()),
							createdAt: Joi.string().isoDate().example(faker.date.past()),
							updatedAt: Joi.string().isoDate().example(faker.date.recent()),
						}).label('User'),
					}),
				}),
			},
			'400': {
				description:
					'Happens when the user id cannot be retrieved from access token.',
				schema: Joi.object<ErrorApiResponse, true>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example('User ID is required'),
				}),
			},
			'401': {
				description: 'Happens when access token is invalid or expired.',
				schema: Joi.object<ErrorApiResponseWithAttributes<{ error: string }>>({
					statusCode: Joi.number().example(401),
					message: Joi.string().example('Expired token'),
					error: Joi.string().example('Unauthorized'),
					attributes: {
						error: 'Expired token',
					},
				}),
			},
			'404': {
				description: 'Happens when the given user cannot be found.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					message: Joi.string().example('User not found'),
					error: Joi.string().example('Not Found'),
				}),
			},
			'500': {
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(500),
					message: Joi.string().example('An internal server error occurred'),
					error: Joi.string().example('Internal Server Error'),
				}),
			},
		},
		order: 3,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'POST /auth/refresh-token': {
		responses: {
			'200': {
				description: 'Returns new access token.',
				schema: Joi.object<ApiResponse<{ accessToken: string }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Successfully refreshed access token'),
					data: Joi.object({
						accessToken: Joi.string().example('Some JWT Access Token'),
					}),
				}),
			},
			'400': {
				description: 'Happens when refresh token is missing or invalid.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example('Refresh token is required'),
				}),
			},
			'401': {
				description: 'Happens when refresh token is expired.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(401),
					error: Joi.string().example('Unauthorized'),
					message: Joi.string().example('Refresh token expired'),
				}),
			},
			'500': {
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(500),
					message: Joi.string().example('An internal server error occurred'),
					error: Joi.string().example('Internal Server Error'),
				}),
			},
		},
		order: 4,
		produces: ['application/json'],
		payloadType: 'json',
	},
};
