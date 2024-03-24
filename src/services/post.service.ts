import { type UUID } from 'crypto';
import {
	type PostEdit,
	type Post,
	type PostCreate,
	type PostDetail,
} from 'src/models';
import { postRepository, userRepository } from 'src/repositories';
import { dataStore } from 'src/store';
import { paginateService } from './pagination.service';
import Boom from '@hapi/boom';

export const postService = {
	addPost(newPostData: PostCreate) {
		const createdAt = new Date().toISOString();

		const newPost: Post = {
			id: crypto.randomUUID(),
			...newPostData,
			createdAt,
			updatedAt: createdAt,
		};

		const isOwnerExist = userRepository.getUserById(dataStore, newPost.owner);

		if (!isOwnerExist) {
			throw Boom.notFound('Post owner is not found!');
		}

		postRepository.addPost(dataStore, newPost);

		return newPost;
	},

	getPosts({
		limit = 10,
		page = 1,
		withTopComments = false,
		hasComments = false,
	}) {
		let allPosts = postRepository.getPosts(dataStore, hasComments);

		if (withTopComments) {
			allPosts = postRepository.populatePostsWithTopComments(
				dataStore,
				allPosts,
			);
		}

		return paginateService.paginate(allPosts, limit, page);
	},

	getUserPosts(userId: UUID, limit = 10, page = 1) {
		const isUserExist = userRepository.getUserById(dataStore, userId);

		if (!isUserExist) {
			throw Boom.notFound('User not found!');
		}

		const userPosts = postRepository.getUserPosts(dataStore, userId);

		return paginateService.paginate(userPosts, limit, page);
	},

	getPostById(id: UUID) {
		const post = postRepository.getPostById(dataStore, id);

		if (!post) {
			throw Boom.notFound('This post is not found!');
		}

		const [postDetail] = postRepository.populatePostsWithTopComments(
			dataStore,
			[post],
		);

		return postDetail;
	},

	updatePost(id: UUID, updatedPostData: PostEdit) {
		const post = this.getPostById(id);

		if (!post) {
			throw Boom.notFound('This post is not found!');
		}

		const updatedPost: Post = {
			...post,
			...updatedPostData,
			updatedAt: new Date().toISOString(),
		};

		// Check if likes user id is valid
		for (const like of updatedPost.likes) {
			const isUserExist = userRepository.getUserById(dataStore, like);

			if (!isUserExist) {
				throw Boom.notFound('Some likes are not valid!');
			}
		}

		// Check if dislikes user id is valid
		for (const dislike of updatedPost.dislikes) {
			const isUserExist = userRepository.getUserById(dataStore, dislike);

			if (!isUserExist) {
				throw Boom.notFound('Some dislikes are not valid!');
			}
		}

		const isUpdated = postRepository.updatePost(dataStore, updatedPost);

		if (!isUpdated) {
			throw Boom.badImplementation('Fail to update post!');
		}

		return updatedPost;
	},

	deletePost(id: UUID) {
		const isDeleted = postRepository.deletePost(dataStore, id);

		if (!isDeleted) {
			throw Boom.notFound('This post is not found!');
		}

		return id;
	},
};
