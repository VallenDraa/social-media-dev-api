import { type PluginSpecificConfiguration } from '@hapi/hapi';
import { SWAGGER_SECURITY_DEFINITION } from 'src/v1/plugins';
import type { MetaData, Post } from 'src/v1/models';
import { emptyArray } from 'src/v1/utils/array-utils';
import { createFakePostExample } from 'src/v1/utils/fake-data';
import {
	apiResponse,
	badRequestApiResponse,
	notFoundApiResponse,
} from 'src/v1/validators';
import { serverErrorApiResponse } from 'src/v1/validators';
import crypto from 'node:crypto';

export const postsSwagger: Record<
	| 'GET /posts'
	| 'POST /users/{userId}/posts'
	| 'GET /users/{userId}/posts'
	| 'GET /posts/{id}'
	| 'PUT /posts/{id}'
	| 'DELETE /posts/{id}',
	NonNullable<PluginSpecificConfiguration['hapi-swagger']>
> = {
	'POST /users/{userId}/posts': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'201': {
				description: 'Returns the newly created post',
				schema: apiResponse<{ post: Post }>(
					{ post: createFakePostExample() },
					'Post created successfully',
					201,
				),
			},
			'400': {
				description: 'Happens when some field is invalid or missing',
				schema: badRequestApiResponse('Description is invalid or missing'),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: notFoundApiResponse('Post owner is not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 1,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'GET /posts': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns posts in a paginated manner.',
				schema: apiResponse<{ posts: Post[]; metadata: MetaData }>(
					{
						posts: emptyArray(3, createFakePostExample),
						metadata: { currentPage: 1, lastPage: 1, limit: 3, total: 3 },
					},
					'Posts fetched successfully',
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
	'GET /users/{userId}/posts': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns posts of a user in a paginated manner.',
				schema: apiResponse<{ posts: Post[]; metadata: MetaData }>(
					{
						posts: emptyArray(3, createFakePostExample),
						metadata: { currentPage: 1, lastPage: 1, limit: 3, total: 3 },
					},
					'Posts fetched successfully',
				),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: notFoundApiResponse('Post owner is not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 3,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'GET /posts/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns a single post from the given post id.',
				schema: apiResponse<{ post: Post }>(
					{ post: createFakePostExample() },
					'Post fetched successfully',
				),
			},
			'404': {
				description: 'Happens when the given post id is missing.',
				schema: notFoundApiResponse('This Post is not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 4,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'PUT /posts/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the edited post.',
				schema: apiResponse<{ post: Post }>(
					{ post: createFakePostExample() },
					'Post updated successfully',
				),
			},
			'400': {
				description: 'Happens when some fields are invalid',
				schema: badRequestApiResponse('Likes are invalid or missing'),
			},
			'404': {
				description:
					'Happens when the given post id is missing or likes/dislikes user id are invalid.',
				schema: notFoundApiResponse('This Post is not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 5,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'DELETE /posts/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the deleted post id.',
				schema: apiResponse<{ postId: string }>(
					{ postId: crypto.randomUUID() },
					'Post deleted successfully',
				),
			},
			'404': {
				description: 'Happens when the given post id is missing.',
				schema: notFoundApiResponse('This Post is not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 6,
		produces: ['application/json'],
		payloadType: 'json',
	},
};
