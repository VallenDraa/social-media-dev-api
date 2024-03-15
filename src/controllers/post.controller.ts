import { type Request, type ResponseToolkit } from '@hapi/hapi';
import { type PostDetail, type Post, type PostCreate } from '../models';
import { postService } from '../services';
import { type MetaData, type ApiResponse } from 'src/models/response.model';
import { type UUID } from 'crypto';

export const postController = {
	createPost(req: Request, h: ResponseToolkit) {
		const post = postService.createPost(req.payload as PostCreate);

		const response: ApiResponse<{ post: Post }> = {
			statusCode: 201,
			message: 'Post created successfully',
			data: { post },
		};

		return h.response(response).code(201);
	},

	getPosts(req: Request, h: ResponseToolkit) {
		const query = req.query as { page: number; limit: number };

		const { data, metadata } = postService.getPosts(query.limit, query.page);

		const response: ApiResponse<{ posts: Post[]; metadata: MetaData }> = {
			statusCode: 200,
			message: 'Posts fetched successfully',
			data: { posts: data, metadata },
		};

		return h.response(response).code(200);
	},

	getPostById(req: Request, h: ResponseToolkit) {
		const params = req.params as { id: UUID };

		const post = postService.getPostById(params.id);

		const response: ApiResponse<{ post: PostDetail }> = {
			statusCode: 200,
			message: 'Post fetched successfully',
			data: { post },
		};

		return h.response(response).code(200);
	},

	updatePost(req: Request, h: ResponseToolkit) {
		const params = req.params as { id: UUID };

		const post = postService.updatePost(params.id, req.payload as PostCreate);

		const response: ApiResponse<{ post: Post }> = {
			statusCode: 200,
			message: 'Post updated successfully',
			data: { post },
		};

		return h.response(response).code(200);
	},

	deletePost(req: Request, h: ResponseToolkit) {
		const params = req.params as { id: string };

		const postId = postService.deletePost(params.id);

		const response: ApiResponse<{ postId: string }> = {
			statusCode: 200,
			message: 'Post deleted successfully',
			data: { postId },
		};

		return h.response(response).code(200);
	},
};
