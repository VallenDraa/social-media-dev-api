import { type PluginSpecificConfiguration } from '@hapi/hapi';
import { type UserWithoutPassword } from 'src/v1/models';
import {
	createFakeUserExample,
	createFakeUserWithoutPasswordExample,
} from 'src/v1/utils/fake-data';
import {
	apiResponse,
	badRequestApiResponse,
	forbiddenApiResponse,
	notFoundApiResponse,
	serverErrorApiResponse,
	unauthorizedApiResponse,
} from 'src/v1/validators';
import crypto from 'node:crypto';
import { SWAGGER_SECURITY_DEFINITION } from 'src/v1/plugins';

export const authSwagger: Record<
	| 'POST /auth/register'
	| 'POST /auth/login'
	| 'GET /auth/logout'
	| 'GET /auth/me'
	| 'POST /auth/refresh-token',
	NonNullable<PluginSpecificConfiguration['hapi-swagger']>
> = {
	'POST /auth/register': {
		responses: {
			'201': {
				description: 'Returns success status.',
				schema: apiResponse<UserWithoutPassword>(
					createFakeUserWithoutPasswordExample(),
					'Registration successful',
					201,
				),
			},
			'400': {
				description: 'Can be because of invalid credentials or duplicate user.',
				schema: badRequestApiResponse(
					'Password and confirm password do not match',
				),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 1,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'POST /auth/login': {
		responses: {
			'200': {
				description:
					'Returns status code with access token and refresh token. The access token will be sent via cookie and response body.',
				schema: apiResponse<{ accessToken: string; refreshToken: string }>(
					{
						accessToken: crypto.randomUUID(),
						refreshToken: crypto.randomUUID(),
					},
					'Login successful',
				),
			},
			'400': {
				description:
					'Happens when there is an invalid field sent from the client.',
				schema: badRequestApiResponse('Email is invalid or missing'),
			},
			'401': {
				description: 'Happens when email or password is incorrect.',
				schema: unauthorizedApiResponse('Invalid email or password'),
			},
			'500': { schema: serverErrorApiResponse },
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
				schema: apiResponse<{ user: UserWithoutPassword }>(
					{ user: createFakeUserExample() },
					'Successfully get current user details',
				),
			},
			'400': {
				description:
					'Happens when the user id cannot be retrieved from access token.',
				schema: badRequestApiResponse('User ID is required'),
			},
			'401': {
				description: 'Happens when access token is invalid or expired.',
				schema: unauthorizedApiResponse('Expired token'),
			},
			'404': {
				description: 'Happens when the given user cannot be found.',
				schema: notFoundApiResponse('User not found'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 3,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'POST /auth/refresh-token': {
		responses: {
			'200': {
				description: 'Returns new access token.',
				schema: apiResponse<{ accessToken: string }>(
					{ accessToken: crypto.randomUUID() },
					'Successfully refreshed access token',
				),
			},
			'400': {
				description: 'Happens when refresh token is missing or invalid.',
				schema: badRequestApiResponse('Refresh token is required'),
			},
			'401': {
				description: 'Happens when refresh token is expired.',
				schema: unauthorizedApiResponse('Refresh token expired'),
			},
			'403': {
				description:
					'Happens when refresh token is sent both via cookie and request payload.',
				schema: forbiddenApiResponse(
					'Cannot send both payload and cookie refresh token',
				),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 4,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'GET /auth/logout': {
		responses: {
			'200': {
				description: 'Returns successful message.',
				schema: apiResponse<null>(null, 'Logout successful'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 5,
		produces: ['application/json'],
		payloadType: 'json',
	},
};
