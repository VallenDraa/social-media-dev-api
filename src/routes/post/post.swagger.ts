import { type PluginSpecificConfiguration } from '@hapi/hapi';
import Joi from 'joi';
import { SWAGGER_SECURITY_DEFINITION } from 'src/constants';
import type { ApiResponse, ErrorApiResponse, MetaData, Post } from 'src/models';
import { emptyArray } from 'src/utils/array-utils';
import { createFakePostExample } from 'src/utils/fake-data';
import { postValidator } from 'src/validators';

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
				schema: Joi.object<ApiResponse<{ post: Post }>>({
					statusCode: Joi.number().example(201),
					message: Joi.string().example('Post created successfully'),
					data: Joi.object({
						post: postValidator.example(createFakePostExample()),
					}),
				}),
			},
			'400': {
				description: 'Happens when some field is invalid or missing',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example('Description is invalid or missing'),
				}),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					error: Joi.string().example('Not Found'),
					message: Joi.string().example('Post owner is not found!'),
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
	'GET /posts': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns posts in a paginated manner.',
				schema: Joi.object<ApiResponse<{ posts: Post[]; metadata: MetaData }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Posts fetched successfully'),
					data: Joi.object({
						posts: Joi.array()
							.items(postValidator)
							.example(emptyArray(3, createFakePostExample)),
						metadata: Joi.object({
							currentPage: Joi.number().example(1),
							lastPage: Joi.number().example(1),
							limit: Joi.number().example(3),
							total: Joi.number().example(3),
						}),
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
	'GET /users/{userId}/posts': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns posts of a user in a paginated manner.',
				schema: Joi.object<ApiResponse<{ posts: Post[]; metadata: MetaData }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Posts fetched successfully'),
					data: Joi.object({
						posts: Joi.array()
							.items(postValidator)
							.example(emptyArray(3, createFakePostExample)),
						metadata: Joi.object({
							currentPage: Joi.number().example(1),
							lastPage: Joi.number().example(1),
							limit: Joi.number().example(3),
							total: Joi.number().example(3),
						}),
					}),
				}),
			},
			'404': {
				description: 'Happens when the given user id is missing.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					error: Joi.string().example('Not Found'),
					message: Joi.string().example('Post owner is not found!'),
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
	'GET /posts/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns a single post from the given post id.',
				schema: Joi.object<ApiResponse<{ post: Post }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Posts fetched successfully'),
					data: { post: postValidator.example(createFakePostExample()) },
				}),
			},
			'404': {
				description: 'Happens when the given post id is missing.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					error: Joi.string().example('Not Found'),
					message: Joi.string().example('This Post is not found!'),
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
	'PUT /posts/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the edited post.',
				schema: Joi.object<ApiResponse<{ post: Post }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Post updated successfully'),
					data: { post: postValidator.example(createFakePostExample()) },
				}),
			},
			'400': {
				description: 'Happens when some fields are invalid',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example('Likes are invalid or missing'),
				}),
			},
			'404': {
				description:
					'Happens when the given post id is missing or likes/dislikes user id are invalid.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					error: Joi.string().example('Not Found'),
					message: Joi.string().example('This Post is not found!'),
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
	'DELETE /posts/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the deleted post id.',
				schema: Joi.object<ApiResponse<{ postId: string }>>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Post deleted successfully'),
					data: { postId: crypto.randomUUID() },
				}),
			},
			'404': {
				description: 'Happens when the given post id is missing.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					error: Joi.string().example('Not Found'),
					message: Joi.string().example('This Post is not found!'),
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
