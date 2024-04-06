import { type ServerRoute } from '@hapi/hapi';
import { postController } from 'src/v1/controllers';
import { failAction } from 'src/v1/utils/fail-action-response';
import {
	createPostValidator,
	editPostValidator,
	idValidator,
	paginateValidator,
	searchPostValidator,
	userIdValidator,
} from 'src/v1/validators';
import { postsSwagger } from './post.swagger';

export const postRoutes: ServerRoute[] = [
	{
		path: '/posts',
		method: 'GET',
		options: {
			description: 'Get all posts',
			notes: 'Gets all posts in a paginated manner.',
			tags: ['api', 'posts'],
			plugins: { 'hapi-swagger': postsSwagger['GET /posts'] },
			validate: {
				failAction,
				query: searchPostValidator,
			},
		},
		handler: postController.getPosts,
	},
	{
		path: '/users/{userId}/posts',
		method: 'GET',
		options: {
			description: "Get all user's posts",
			notes: 'Gets all posts of a user in a paginated manner.',
			tags: ['api', 'posts'],
			plugins: { 'hapi-swagger': postsSwagger['GET /users/{userId}/posts'] },
			validate: {
				failAction,
				params: userIdValidator,
				query: paginateValidator,
			},
		},
		handler: postController.getUserPosts,
	},
	{
		path: '/posts/{id}',
		method: 'GET',
		options: {
			description: 'Get a single post',
			notes: 'Gets the data of a single post.',
			tags: ['api', 'posts'],
			plugins: { 'hapi-swagger': postsSwagger['GET /posts/{id}'] },
			validate: { failAction, params: idValidator },
		},
		handler: postController.getPostById,
	},
	{
		path: '/users/{userId}/posts',
		method: 'POST',
		options: {
			description: 'Create a new post',
			notes: 'Creates a new post.',
			tags: ['api', 'posts'],
			plugins: { 'hapi-swagger': postsSwagger['POST /users/{userId}/posts'] },
			validate: {
				failAction,
				params: userIdValidator,
				payload: createPostValidator,
			},
		},
		handler: postController.addPost,
	},
	{
		path: '/posts/{id}',
		method: 'PUT',
		options: {
			description: 'Edit a post',
			notes: 'Edits an existing post with new data.',
			tags: ['api', 'posts'],
			plugins: { 'hapi-swagger': postsSwagger['PUT /posts/{id}'] },
			validate: { failAction, params: idValidator, payload: editPostValidator },
		},
		handler: postController.updatePost,
	},
	{
		path: '/posts/{id}',
		method: 'DELETE',
		options: {
			description: 'Delete a post',
			notes: 'Deletes an existing post.',
			tags: ['api', 'posts'],
			plugins: { 'hapi-swagger': postsSwagger['DELETE /posts/{id}'] },
			validate: { failAction, params: idValidator },
		},
		handler: postController.deletePost,
	},
];
