import { type UUID } from 'crypto';
import { type CommentEdit, type CommentCreate, type Comment } from 'src/models';
import { commentRepository } from 'src/repositories';
import { store } from 'src/store';
import Boom from '@hapi/boom';
import { paginateService } from './pagination.service';

export const commentService = {
	addComment(newCommentData: CommentCreate) {
		const createdAt = new Date().toISOString();

		const newComment: Comment = {
			id: crypto.randomUUID(),
			...newCommentData,
			createdAt,
			updatedAt: createdAt,
		};

		commentRepository.addComment(store, newComment);

		return newComment;
	},

	getCommentsOfPost(postId: UUID, limit = 10, page = 1) {
		const allComments = commentRepository.getCommentsOfPost(store, postId);

		return paginateService.paginate(allComments, limit, page);
	},

	getCommentById(id: UUID) {
		const comment = commentRepository.getCommentById(store, id);

		if (!comment) {
			throw Boom.notFound('This comment is not found!');
		}

		return comment;
	},

	updateComment(id: UUID, updatedCommentData: CommentEdit) {
		const comment = this.getCommentById(id);

		const updatedComment: Comment = {
			...comment,
			...updatedCommentData,
			updatedAt: new Date().toISOString(),
		};

		const isUpdated = commentRepository.updateComment(store, updatedComment);

		if (!isUpdated) {
			throw Boom.notFound('This comment is not found!');
		}

		return updatedComment;
	},

	deleteComment(id: UUID) {
		const isDeleted = commentRepository.deleteComment(store, id);

		if (!isDeleted) {
			throw Boom.notFound('This comment is not found!');
		}

		return id;
	},
};
