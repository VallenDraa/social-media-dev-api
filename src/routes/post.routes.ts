import { type ServerRoute } from '@hapi/hapi';
import { postController } from 'src/controllers/post.controller';
import { failAction } from 'src/utils/fail-action-response';
import {
	createPostValidator,
	editPostValidator,
	idValidator,
	paginateValidator,
} from 'src/validators';

export const postRoutes: ServerRoute[] = [
	{
		path: '/posts',
		method: 'GET',
		options: {
			validate: {
				failAction,
				query: paginateValidator,
			},
		},
		handler: postController.getPosts,
	},
	{
		path: '/posts/{id}',
		method: 'GET',
		handler: postController.getPostById,
	},
	{
		path: '/posts',
		method: 'POST',
		options: {
			validate: {
				failAction,
				payload: createPostValidator,
			},
		},
		handler: postController.createPost,
	},
	{
		path: '/posts/{id}',
		method: 'PUT',
		options: {
			validate: {
				failAction,
				params: idValidator,
				payload: editPostValidator,
			},
		},
		handler: postController.updatePost,
	},
	{
		path: '/posts/{id}',
		method: 'DELETE',
		options: {
			validate: {
				failAction,
				params: idValidator,
			},
		},
		handler: postController.deletePost,
	},
];
