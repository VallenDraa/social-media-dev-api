import { type PluginSpecificConfiguration } from '@hapi/hapi';
import { SWAGGER_SECURITY_DEFINITION } from 'src/constants';
import type { FriendshipDataDetail, FriendsList, MetaData } from 'src/models';
import { createFakeFriendsListExample } from 'src/utils/fake-data';
import {
	apiResponse,
	badRequestApiResponse,
	notFoundApiResponse,
	serverErrorApiResponse,
} from 'src/validators';
import crypto from 'node:crypto';

export const friendSwagger: Record<
	| 'GET /users/{userId}/friends'
	| 'POST /users/{userId}/friends/{friendId}'
	| 'DELETE /users/{userId}/friends/{friendId}',
	NonNullable<PluginSpecificConfiguration['hapi-swagger']>
> = {
	'GET /users/{userId}/friends': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the friendsList of a user from the given id.',
				schema: apiResponse<{
					friendsList: FriendsList | FriendsList<FriendshipDataDetail>;
					metadata: MetaData;
				}>(
					{
						friendsList: createFakeFriendsListExample(),
						metadata: { currentPage: 1, lastPage: 1, limit: 3, total: 3 },
					},
					'Friends fetched successfully',
				),
			},
			'400': {
				description: 'Happens when the given user id or some query is invalid.',
				schema: badRequestApiResponse('"with-user-data" must be a boolean'),
			},
			'404': {
				description:
					'Happens when the friendsList from given user id cannot be found.',
				schema: notFoundApiResponse(
					'Cannot find friends list from the given user!',
				),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 1,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'POST /users/{userId}/friends/{friendId}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the added friend id.',
				schema: apiResponse<{ friendId: string }>(
					{ friendId: crypto.randomUUID() },
					'Friend added successfully',
				),
			},
			'400': {
				description: 'Happens when the given user id or friend id is invalid.',
				schema: badRequestApiResponse('"userId" must be a boolean'),
			},
			'404': {
				description: 'Happens when the given user id or friend id is missing.',
				schema: notFoundApiResponse(
					'User that is to be a new friend cannot be found!',
				),
			},
			'409': {
				description: 'Happens when the given friend id is already removed.',
				schema: notFoundApiResponse('This user is already your friend!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 2,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'DELETE /users/{userId}/friends/{friendId}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the deleted friend id.',
				schema: apiResponse<{ friendId: string }>(
					{ friendId: crypto.randomUUID() },
					'Friend removed successfully',
				),
			},
			'400': {
				description: 'Happens when the given user id or friend id is invalid.',
				schema: badRequestApiResponse('"userId" must be a boolean'),
			},
			'404': {
				description: 'Happens when the given user id or friend id is missing.',
				schema: notFoundApiResponse(
					'Cannot find friends list from the given user!',
				),
			},
			'409': {
				description: 'Happens when the given friend id is already removed.',
				schema: notFoundApiResponse('This user is already not your friend!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 3,
		produces: ['application/json'],
		payloadType: 'json',
	},
};
