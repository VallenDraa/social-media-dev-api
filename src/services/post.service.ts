import { type UUID } from 'crypto';
import { type PostEdit, type Post, type PostCreate } from 'src/models';
import { postRepository } from 'src/repositories';
import { dataStore } from 'src/store';
import Boom from '@hapi/boom';
import { paginateService } from './pagination.service';

export const postService = {
	addPost(newPostData: PostCreate) {
		const createdAt = new Date().toISOString();

		const newPost: Post = {
			id: crypto.randomUUID(),
			...newPostData,
			createdAt,
			updatedAt: createdAt,
		};

		postRepository.addPost(dataStore, newPost);

		return newPost;
	},

	getPosts(limit = 10, page = 1) {
		const allPosts = postRepository.getPosts(dataStore);

		return paginateService.paginate(allPosts, limit, page);
	},

	getPostById(id: UUID) {
		const post = postRepository.getPostById(dataStore, id);

		if (!post) {
			throw Boom.notFound('This post is not found!');
		}

		return post;
	},

	updatePost(id: UUID, updatedPostData: PostEdit) {
		const post = this.getPostById(id);

		const updatedPost: Post = {
			...post,
			...updatedPostData,
			updatedAt: new Date().toISOString(),
		};

		const isUpdated = postRepository.updatePost(dataStore, updatedPost);

		if (!isUpdated) {
			throw Boom.notFound('This post is not found!');
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
