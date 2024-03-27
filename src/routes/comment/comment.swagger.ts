import { type UUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { type PluginSpecificConfiguration } from '@hapi/hapi';
import Joi from 'joi';
import {
	type ApiResponse,
	type ErrorApiResponse,
	type MetaData,
} from 'src/models';
import { emptyArray } from 'src/utils/array-utils';
import { createFakeCommentExample } from 'src/utils/fake-data';
import { commentValidator } from 'src/validators';
import { SWAGGER_SECURITY_DEFINITION } from 'src/constants';

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
				schema: Joi.object<ApiResponse<{ comment: Comment }>>({
					statusCode: Joi.number().example(201),
					message: Joi.string().example('Registration successful'),
					data: commentValidator,
				}),
			},
			'404': {
				description:
					'Happens because the post retrieved from the post id is not found.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					message: Joi.string().example(
						'The post for this comment is missing!',
					),
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
		order: 1,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'GET /posts/{postId}/comments': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the comments of a post.',
				schema: Joi.object<
					ApiResponse<{ comments: Comment[]; metadata: MetaData }>,
					true
				>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Comments fetched successfully'),
					data: Joi.object({
						comments: commentValidator.example(
							emptyArray(4, createFakeCommentExample),
						),
						metadata: Joi.object({
							currentPage: Joi.number().example(1),
							lastPage: Joi.number().example(1),
							limit: Joi.number().example(4),
							total: Joi.number().example(4),
						}),
					}),
				}),
			},
			'400': {
				description:
					'Happens when there is an invalid field sent from the client.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(400),
					message: Joi.string().example('Page is invalid or missing'),
					error: Joi.string().example('Bad Request'),
				}),
			},
			'404': {
				description: 'Happens when the post id is not found.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					message: Joi.string().example('This post is not found!'),
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
		order: 2,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'GET /comments/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the comment data from the given comment id.',
				schema: Joi.object<ApiResponse<{ comment: Comment }>, true>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Comment fetched successfully'),
					data: Joi.object({
						comment: commentValidator.example(createFakeCommentExample()),
					}),
				}),
			},
			'400': {
				description: 'Happens when the comment id is invalid.',
				schema: Joi.object<ErrorApiResponse, true>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example('"id" must be a valid GUID'),
				}),
			},
			'404': {
				description: 'Happens when the given comment cannot be found.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					message: Joi.string().example('This comment is not found!'),
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
	'PUT /comments/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the new edited comment.',
				schema: Joi.object<ApiResponse<{ comment: Comment }>, true>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Comment updated successfully'),
					data: Joi.object({
						comment: commentValidator.example(createFakeCommentExample()),
					}),
				}),
			},
			'400': {
				description:
					'Happens when the comment id or any other fields are invalid.',
				schema: Joi.object<ErrorApiResponse, true>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example('"id" must be a valid GUID'),
				}),
			},
			'404': {
				description: 'Happens when the given comment cannot be found.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					message: Joi.string().example('This comment is not found!'),
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
		order: 4,
		produces: ['application/json'],
		payloadType: 'json',
	},
	'DELETE /comments/{id}': {
		security: [{ [SWAGGER_SECURITY_DEFINITION]: [] }],
		responses: {
			'200': {
				description: 'Returns the id of the deleted comment .',
				schema: Joi.object<ApiResponse<{ commentId: UUID }>, true>({
					statusCode: Joi.number().example(200),
					message: Joi.string().example('Comment deleted successfully'),
					data: Joi.object({
						commentId: Joi.string().example(faker.string.uuid()),
					}),
				}),
			},
			'400': {
				description:
					'Happens when the comment id or any other fields are invalid.',
				schema: Joi.object<ErrorApiResponse, true>({
					statusCode: Joi.number().example(400),
					error: Joi.string().example('Bad Request'),
					message: Joi.string().example('"id" must be a valid GUID'),
				}),
			},
			'404': {
				description: 'Happens when the given comment cannot be found.',
				schema: Joi.object<ErrorApiResponse>({
					statusCode: Joi.number().example(404),
					message: Joi.string().example('This comment is not found!'),
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
		order: 5,
		produces: ['application/json'],
		payloadType: 'json',
	},
};
