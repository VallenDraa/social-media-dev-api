import { type PluginSpecificConfiguration } from '@hapi/hapi';
import Joi from 'joi';
import { SWAGGER_SECURITY_DEFINITION } from 'src/v1/plugins';
import type {
	ErrorApiResponse,
	MetaData,
	UserWithoutPassword,
} from 'src/v1/models';
import { emptyArray } from 'src/v1/utils/array-utils';
import { createFakeUserWithoutPasswordExample } from 'src/v1/utils/fake-data';
import {
	apiResponse,
	badRequestApiResponse,
	notFoundApiResponse,
	serverErrorApiResponse,
} from 'src/v1/validators';
import crypto from 'node:crypto';

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
				schema: apiResponse<{ user: UserWithoutPassword }>(
					{ user: createFakeUserWithoutPasswordExample() },
					'User created successfully',
					201,
				),
			},
			'400': {
				description: 'Happens when some field is invalid or missing',
				schema: badRequestApiResponse('Email is invalid or missing'),
			},
			'500': { schema: serverErrorApiResponse },
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
				schema: apiResponse<{
					users: UserWithoutPassword[];
					metadata: MetaData;
				}>(
					{
						users: emptyArray(3, createFakeUserWithoutPasswordExample),
						metadata: { currentPage: 1, lastPage: 1, limit: 3, total: 3 },
					},
					'Users fetched successfully',
				),
			},
			'400': {
				description: 'Happens when some query parameters are invalid',
				schema: badRequestApiResponse('"page" must be a number'),
			},
			'500': { schema: serverErrorApiResponse },
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
				schema: apiResponse<{ user: UserWithoutPassword }>(
					{ user: createFakeUserWithoutPasswordExample() },
					'User fetched successfully',
				),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: notFoundApiResponse('User not found!'),
			},
			'500': { schema: serverErrorApiResponse },
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
				schema: apiResponse<{ user: UserWithoutPassword }>(
					{ user: createFakeUserWithoutPasswordExample() },
					'User updated successfully',
				),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: notFoundApiResponse('User not found!'),
			},
			'500': { schema: serverErrorApiResponse },
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
				schema: apiResponse<{ userId: string }>(
					{ userId: crypto.randomUUID() },
					'User password updated successfully',
				),
			},
			'400': {
				description: 'Happens when password is the same',
				schema: badRequestApiResponse(
					'The new password must be different from the old password!',
				),
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
				schema: notFoundApiResponse('User not found!'),
			},
			'500': { schema: serverErrorApiResponse },
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
				schema: apiResponse<{ userId: string }>(
					{ userId: crypto.randomUUID() },
					'User deleted successfully',
				),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: notFoundApiResponse('User not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 6,
		produces: ['application/json'],
		payloadType: 'json',
	},
};
