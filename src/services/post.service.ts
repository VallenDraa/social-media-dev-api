import { type UUID } from 'crypto';
import { type PostEdit, type Post, type PostCreate } from 'src/models';
import { postRepository } from 'src/repositories';
import { store } from 'src/store';
import Boom from '@hapi/boom';
import { paginateService } from './pagination.service';

export const postService = {
	createPost(newPostData: PostCreate) {
		const createdAt = new Date().toISOString();

		const newPost: Post = {
			id: crypto.randomUUID(),
			...newPostData,
			createdAt,
			updatedAt: createdAt,
		};

		postRepository.addPost(store, newPost);

		return newPost;
	},

	getPosts(limit = 10, page = 1) {
		const allPosts = postRepository.getPosts(store);

		return paginateService.paginate(allPosts, limit, page);
	},

	getPostById(id: string) {
		const post = postRepository.getPostById(store, id);

		if (!post) {
			throw Boom.notFound('This post is not found!');
		}

		return post;
	},

	updatePost(id: UUID, updatedPostData: PostEdit) {
		const updatedPost: Post = {
			id,
			...updatedPostData,
			updatedAt: new Date().toISOString(),
		};

		const isUpdated = postRepository.updatePost(store, updatedPost);

		if (!isUpdated) {
			throw Boom.notFound('This post is not found!');
		}

		return updatedPost;
	},

	deletePost(id: string) {
		const isDeleted = postRepository.deletePost(store, id);

		if (!isDeleted) {
			throw Boom.notFound('This post is not found!');
		}

		return id;
	},
};
