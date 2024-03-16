import { type UUID } from 'crypto';
import { type PostDetail, type Post } from 'src/models';
import { type Store } from 'src/store';

export const postRepository = {
	addPost(store: Store, post: Post) {
		store.setState(state => ({
			...state,
			posts: [post, ...state.posts],
		}));
	},

	getPosts: (store: Store) => store.getState().posts,

	getPostById(store: Store, id: UUID) {
		const { posts, comments } = store.getState();

		const post = posts.find(post => post.id === id);

		if (!post) {
			return null;
		}

		const postDetail: PostDetail = {
			...post,
			comments: comments
				.filter(comment => comment.post === id)
				.map(comment => comment.id),
		};

		return postDetail;
	},

	updatePost(store: Store, updatedPost: Post) {
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

	deletePost(store: Store, id: UUID) {
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
