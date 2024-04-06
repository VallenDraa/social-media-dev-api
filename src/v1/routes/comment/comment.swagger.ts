import { type PluginSpecificConfiguration } from '@hapi/hapi';
import { type Comment, type MetaData } from 'src/v1/models';
import { emptyArray } from 'src/v1/utils/array-utils';
import { createFakeCommentExample } from 'src/v1/utils/fake-data';
import {
	apiResponse,
	badRequestApiResponse,
	notFoundApiResponse,
	serverErrorApiResponse,
} from 'src/v1/validators';
import crypto from 'node:crypto';
import { SWAGGER_SECURITY_DEFINITION } from 'src/v1/plugins';

export const commentSwagger: Record<
	| 'GET /posts/{postId}/comments'
	| 'GET /comments/{id}'
	| 'POST /posts/{postId}/comments'
	| 'PUT /comments/{id}'
	| 'DELETE /comments/{id}',
	NonNullable<PluginSpecificConfiguration['hapi-swagger']>
> = {
	'POST /posts/{postId}/comments': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'201': {
				description: 'Returns the newly created comment.',
				schema: apiResponse<{ comment: Comment }>(
					{ comment: createFakeCommentExample() },
					'Registration successful',
					201,
				),
			},
			'404': {
				description:
					'Happens because the post retrieved from the post id is not found.',
				schema: notFoundApiResponse('The post for this comment is missing!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 1,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'GET /posts/{postId}/comments': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the comments of a post.',
				schema: apiResponse<{ comments: Comment[]; metadata: MetaData }>(
					{
						comments: emptyArray(3, createFakeCommentExample),
						metadata: { currentPage: 1, lastPage: 1, limit: 3, total: 3 },
					},
					'Comments fetched successfully',
				),
			},
			'400': {
				description:
					'Happens when there is an invalid field sent from the client.',
				schema: badRequestApiResponse('Page is invalid or missing'),
			},
			'404': {
				description: 'Happens when the post id is not found.',
				schema: notFoundApiResponse('This post is not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 2,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'GET /comments/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the comment data from the given comment id.',
				schema: apiResponse<{ comment: Comment }>(
					{ comment: createFakeCommentExample() },
					'Comment fetched successfully',
				),
			},
			'400': {
				description: 'Happens when the comment id is invalid.',
				schema: badRequestApiResponse('"id" must be a valid GUID'),
			},
			'404': {
				description: 'Happens when the given comment cannot be found.',
				schema: notFoundApiResponse('This comment is not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 3,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'PUT /comments/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the new edited comment.',
				schema: apiResponse<{ comment: Comment }>(
					{ comment: createFakeCommentExample() },
					'Comment updated successfully',
				),
			},
			'400': {
				description:
					'Happens when the comment id or any other fields are invalid.',
				schema: badRequestApiResponse('"id" must be a valid GUID'),
			},
			'404': {
				description: 'Happens when the given comment cannot be found.',
				schema: notFoundApiResponse('This comment is not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 4,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'DELETE /comments/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the id of the deleted comment .',
				schema: apiResponse<{ commentId: crypto.UUID }>(
					{ commentId: crypto.randomUUID() },
					'Comment deleted successfully',
				),
			},
			'400': {
				description:
					'Happens when the comment id or any other fields are invalid.',
				schema: badRequestApiResponse('"id" must be a valid GUID'),
			},
			'404': {
				description: 'Happens when the given comment cannot be found.',
				schema: notFoundApiResponse('This comment is not found!'),
			},
			'500': { schema: serverErrorApiResponse },
		},
		order: 5,
		produces: ['application/json'],
		payloadType: 'json',
	},
};
