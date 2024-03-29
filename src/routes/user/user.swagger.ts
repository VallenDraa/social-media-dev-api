import { type PluginSpecificConfiguration } from '@hapi/hapi';
import Joi from 'joi';
import { SWAGGER_SECURITY_DEFINITION } from 'src/constants';
import type {
	ApiResponse,
	ErrorApiResponse,
	MetaData,
	UserWithoutPassword,
} from 'src/models';
import { emptyArray } from 'src/utils/array-utils';
import { createFakeUserExample } from 'src/utils/fake-data';
import {
	metadataValidator,
	userIdValidator,
	userWithoutPasswordValidator,
} from 'src/validators';

export const usersSwagger: Record<
	| 'POST /users'
	| 'GET /users'
	| 'GET /users/{id}'
	| 'PUT /users/{id}'
	| 'PUT /users/{id}/password'
	| 'DELETE /users/{id}',
	NonNullable<PluginSpecificConfiguration['hapi-swagger']>
> = {
	'POST /users': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'201': {
				description: 'Returns the newly created user',
				schema: Joi.object<ApiResponse<{ user: UserWithoutPassword }>>({
					statusCode: Joi.number().example(201),
					message: Joi.string().example('User created successfully'),
					data: Joi.object({ user: userWithoutPasswordValidator }),
				}),
			},
			'400': {
				description: 'Happens when some field is invalid or missing',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example('Email is invalid or missing'),
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
	'GET /users': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns Users in a paginated manner.',
				schema: Joi.object<
					ApiResponse<{ users: UserWithoutPassword[]; metadata: MetaData }>
				>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Users fetched successfully'),
					data: Joi.object({
						users: Joi.array()
							.items(userWithoutPasswordValidator)
							.example(emptyArray(3, createFakeUserExample)),
						metadata: metadataValidator,
					}),
				}),
			},
			'400': {
				description: 'Happens when some query parameters are invalid',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example('"page" must be a number'),
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
	'GET /users/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns a single user from the given id.',
				schema: Joi.object<ApiResponse<{ user: UserWithoutPassword }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('User fetched successfully'),
					data: Joi.object({ user: userWithoutPasswordValidator }),
				}),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					error: Joi.string().example('Not Found'),
					message: Joi.string().example('User not found!'),
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
	'PUT /users/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Edits an existing user.',
				schema: Joi.object<ApiResponse<{ user: UserWithoutPassword }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('User updated successfully'),
					data: Joi.object({ user: userWithoutPasswordValidator }),
				}),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					error: Joi.string().example('Not Found'),
					message: Joi.string().example('User not found!'),
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
	'PUT /users/{id}/password': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the id of the edited user password.',
				schema: Joi.object<ApiResponse<{ userId: string }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('User password updated successfully'),
					data: Joi.object({ userId: userIdValidator }),
				}),
			},
			'400': {
				description: 'Happens when password is the same',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example(
						'The new password must be different from the old password!',
					),
				}),
			},
			'401': {
				description: 'Happens when password confirmation is wrong.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Unauthorized'),
					message: Joi.string().example('Current password is incorrect!'),
				}),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					error: Joi.string().example('Not Found'),
					message: Joi.string().example('User not found!'),
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
		order: 5,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'DELETE /users/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the deleted user id.',
				schema: Joi.object<ApiResponse<{ userId: string }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('User deleted successfully'),
					data: Joi.object({ userId: userIdValidator }),
				}),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					error: Joi.string().example('Not Found'),
					message: Joi.string().example('User not found!'),
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
		order: 6,
		produces: ['application/json'],
		payloadType: 'json',
	},
};
