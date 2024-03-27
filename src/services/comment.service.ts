import { type UUID } from 'crypto';
import { type CommentEdit, type CommentCreate, type Comment } from 'src/models';
import {
	commentRepository,
	postRepository,
	userRepository,
} from 'src/repositories';
import { dataStore } from 'src/store';
import Boom from '@hapi/boom';
import { paginateService } from './pagination.service';

export const commentService = {
	addComment(postId: UUID, newCommentData: CommentCreate) {
		const post = postRepository.getPostById(dataStore, postId);

		if (!post) {
			throw Boom.notFound('The post for this comment is missing!');
		}

		const createdAt = new Date().toISOString();
		const newComment: Comment = {
			id: crypto.randomUUID(),
			...newCommentData,
			likes: [],
			dislikes: [],
			replies: [],
			post: postId,
			createdAt,
			updatedAt: createdAt,
		};

		commentRepository.addComment(dataStore, newComment);

		return newComment;
	},

	getCommentsOfPost(postId: UUID, limit = 10, page = 1) {
		const allComments = commentRepository.getCommentsOfPost(dataStore, postId);

		if (!allComments) {
			throw Boom.notFound('This post is not found!');
		}

		return paginateService.paginate(allComments, limit, page);
	},

	getCommentById(id: UUID) {
		const comment = commentRepository.getCommentById(dataStore, id);

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

		// Check if likes user id is valid
		for (const like of updatedComment.likes) {
			const isUserExist = userRepository.getUserById(dataStore, like);

			if (!isUserExist) {
				throw Boom.notFound('Some likes are not valid!');
			}
		}

		// Check if dislikes user id is valid
		for (const dislike of updatedComment.dislikes) {
			const isUserExist = userRepository.getUserById(dataStore, dislike);

			if (!isUserExist) {
				throw Boom.notFound('Some dislikes are not valid!');
			}
		}

		const isUpdated = commentRepository.updateComment(
			dataStore,
			updatedComment,
		);

		if (!isUpdated) {
			throw Boom.notFound('This comment is not found!');
		}

		return updatedComment;
	},

	deleteComment(id: UUID) {
		const isDeleted = commentRepository.deleteComment(dataStore, id);

		if (!isDeleted) {
			throw Boom.notFound('This comment is not found!');
		}

		return id;
	},
};
