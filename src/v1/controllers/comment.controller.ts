import { type Request, type ResponseToolkit } from '@hapi/hapi';
import {
	type Comment,
	type CommentEdit,
	type CommentCreate,
} from 'src/v1/models';
import { type MetaData, type ApiResponse } from 'src/v1/models/response.model';
import { type UUID } from 'node:crypto';
import { commentService } from 'src/v1/services';

export const commentController = {
	addComment(req: Request, h: ResponseToolkit) {
		const { postId } = req.params as { postId: UUID };
		const payload = req.payload as CommentCreate;

		const comment = commentService.addComment(postId, payload);

		const response: ApiResponse<{ comment: Comment }> = {
			statusCode: 201,
			message: 'Comment created successfully',
			data: { comment },
		};

		return h.response(response).code(201);
	},

	getCommentsOfPost(req: Request, h: ResponseToolkit) {
		const { limit, page } = req.query as { page: number; limit: number };
		const { postId } = req.params as { postId: UUID };

		const { data, metadata } = commentService.getCommentsOfPost(
			postId,
			limit,
			page,
		);

		const response: ApiResponse<{ comments: Comment[]; metadata: MetaData }> = {
			statusCode: 200,
			message: 'Comments fetched successfully',
			data: { comments: data, metadata },
		};

		return h.response(response).code(200);
	},

	getCommentById(req: Request, h: ResponseToolkit) {
		const { id } = req.params as { id: UUID };

		const comment = commentService.getCommentById(id);

		const response: ApiResponse<{ comment: Comment }> = {
			statusCode: 200,
			message: 'Comment fetched successfully',
			data: { comment },
		};

		return h.response(response).code(200);
	},

	updateComment(req: Request, h: ResponseToolkit) {
		const { id } = req.params as { id: UUID };

		const comment = commentService.updateComment(
			id,
			req.payload as CommentEdit,
		);

		const response: ApiResponse<{ comment: Comment }> = {
			statusCode: 200,
			message: 'Comment updated successfully',
			data: { comment },
		};

		return h.response(response).code(200);
	},

	deleteComment(req: Request, h: ResponseToolkit) {
		const { id } = req.params as { id: UUID };

		const commentId = commentService.deleteComment(id);

		const response: ApiResponse<{ commentId: UUID }> = {
			statusCode: 200,
			message: 'Comment deleted successfully',
			data: { commentId },
		};

		return h.response(response).code(200);
	},
};
