import { type UUID } from 'crypto';
import { type Comment } from 'src/models';
import { type DataStore } from 'src/store';

export const commentRepository = {
	addComment(store: DataStore, comment: Comment) {
		store.setState(state => ({
			...state,
			comments: [comment, ...state.comments],
		}));
	},

	getCommentsOfPost(store: DataStore, postId: UUID) {
		const { posts } = store.getState();
		const { comments } = store.getState();

		const post = posts.find(post => post.id === postId);

		if (!post) {
			return null;
		}

		return comments.filter(comment => comment.post === postId);
	},

	getCommentById(store: DataStore, id: UUID) {
		const { comments } = store.getState();

		const comment = comments.find(comment => comment.id === id);

		return comment ?? null;
	},

	updateComment(store: DataStore, updatedComment: Comment) {
		let isUpdated = false;

		store.setState(state => ({
			...state,
			comments: state.comments.map(comment => {
				if (comment.id === updatedComment.id) {
					isUpdated = true;
					return updatedComment;
				}

				return comment;
			}),
		}));

		return isUpdated;
	},

	deleteComment(store: DataStore, id: UUID) {
		let isDeleted = false;

		store.setState(state => ({
			...state,
			comments: state.comments.filter(comment => {
				if (comment.id === id) {
					isDeleted = true;
					return false;
				}

				return true;
			}),
		}));

		return isDeleted;
	},
};
