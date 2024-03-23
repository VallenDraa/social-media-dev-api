import { type ServerRoute } from '@hapi/hapi';
import { commentController } from 'src/controllers';
import { failAction } from 'src/utils/fail-action-response';
import { idValidator, postIdValidator } from 'src/validators';
import { createCommentValidator, editCommentValidator } from 'src/validators/';

export const commentRoutes: ServerRoute[] = [
	{
		path: '/posts/{postId}/comments',
		method: 'GET',
		options: {
			validate: {
				failAction,
				params: postIdValidator,
			},
		},
		handler: commentController.getCommentsOfPost,
	},
	{
		path: '/comments/{id}',
		method: 'GET',
		handler: commentController.getCommentById,
	},
	{
		path: '/comments',
		method: 'POST',
		options: {
			validate: {
				failAction,
				payload: createCommentValidator,
			},
		},
		handler: commentController.addComment,
	},
	{
		path: '/comments/{id}',
		method: 'PUT',
		options: {
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
			validate: {
				failAction,
				params: idValidator,
			},
		},
		handler: commentController.deleteComment,
	},
];
