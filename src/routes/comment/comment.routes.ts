import { type ServerRoute } from '@hapi/hapi';
import { commentController } from 'src/controllers';
import { failAction } from 'src/utils/fail-action-response';
import {
	idValidator,
	paginateValidator,
	postIdValidator,
} from 'src/validators';
import { createCommentValidator, editCommentValidator } from 'src/validators/';
import { commentSwagger } from './comment.swagger';

export const commentRoutes: ServerRoute[] = [
	{
		path: '/posts/{postId}/comments',
		method: 'GET',
		options: {
			description: 'Get all comments of a post',
			notes: 'Returns all of the comments of a post in a paginated manner.',
			tags: ['api', 'comments'],
			plugins: {
				'hapi-swagger': commentSwagger['GET /posts/{postId}/comments'],
			},
			validate: {
				failAction,
				params: postIdValidator,
				query: paginateValidator,
			},
		},
		handler: commentController.getCommentsOfPost,
	},
	{
		path: '/comments/{id}',
		method: 'GET',
		options: {
			description: 'Get a comment',
			notes: 'Returns the detail of a comment from the provided comment id.',
			tags: ['api', 'comments'],
			plugins: {
				'hapi-swagger': commentSwagger['GET /comments/{id}'],
			},
			validate: {
				failAction,
				params: idValidator,
			},
		},
		handler: commentController.getCommentById,
	},
	{
		path: '/posts/{postId}/comments',
		method: 'POST',
		options: {
			description: 'Create a comment',
			notes:
				'Creates a new comment for a post and returns the newly created comment.',
			tags: ['api', 'comments'],
			plugins: {
				'hapi-swagger': commentSwagger['POST /posts/{postId}/comments'],
			},
			validate: {
				failAction,
				params: postIdValidator,
				payload: createCommentValidator,
			},
		},
		handler: commentController.addComment,
	},
	{
		path: '/comments/{id}',
		method: 'PUT',
		options: {
			description: 'Edit a comment',
			notes: 'Edits the data of a comment from a given comment id.',
			tags: ['api', 'comments'],
			plugins: {
				'hapi-swagger': commentSwagger['PUT /comments/{id}'],
			},
			validate: {
				failAction,
				params: idValidator,
				payload: editCommentValidator,
			},
		},
		handler: commentController.updateComment,
	},
	{
		path: '/comments/{id}',
		method: 'DELETE',
		options: {
			description: 'Delete a comment',
			notes: 'Deletes a comment from a post.',
			tags: ['api', 'comments'],
			plugins: {
				'hapi-swagger': commentSwagger['DELETE /comments/{id}'],
			},
			validate: {
				failAction,
				params: idValidator,
			},
		},
		handler: commentController.deleteComment,
	},
];
