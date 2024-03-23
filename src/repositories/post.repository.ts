import { type UUID } from 'crypto';
import { type PostDetail, type Post } from 'src/models';
import { type DataStore } from 'src/store';

export const postRepository = {
	addPost(store: DataStore, post: Post) {
		store.setState(state => ({
			...state,
			posts: [post, ...state.posts],
		}));
	},

	getPosts({ store, hasComments }: { store: DataStore; hasComments: boolean }) {
		const { posts, comments } = store.getState();
		let results = posts;

		if (hasComments) {
			results = results.filter(post => {
				const postComments = comments.filter(
					comment => comment.post === post.id,
				);

				return postComments.length > 0;
			});
		}

		return results;
	},

	getPostById(store: DataStore, id: UUID) {
		const { posts } = store.getState();

		const post = posts.find(post => post.id === id);

		return post ?? null;
	},

	populatePostsWithTopComments(store: DataStore, posts: Post[]): PostDetail[] {
		const { comments } = store.getState();

		return posts.map(post => {
			const postComments = comments.filter(comment => comment.post === post.id);

			return {
				...post,
				comments: postComments.map(comment => comment.id).slice(0, 3),
			};
		});
	},

	updatePost(store: DataStore, updatedPost: Post) {
		let isUpdated = false;

		store.setState(state => ({
			...state,
			posts: state.posts.map(post => {
				if (post.id === updatedPost.id) {
					isUpdated = true;
					return updatedPost;
				}

				return post;
			}),
		}));

		return isUpdated;
	},

	deletePost(store: DataStore, id: UUID) {
		let isDeleted = false;

		store.setState(state => ({
			...state,
			posts: state.posts.filter(post => {
				if (post.id === id) {
					isDeleted = true;
					return false;
				}

				return true;
			}),
		}));

		return isDeleted;
	},
};
