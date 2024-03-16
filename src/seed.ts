import { type UUID } from 'crypto';
import { type User, type Post, type Comment } from './models';
import { type Store } from './store';
import {
	createFakeComment,
	createFakeUser,
	createFakePost,
} from './utils/fake-data';
import {
	getRandomFromArray,
	getRandomsFromArray,
} from './utils/get-randoms-from-array';
import { faker } from '@faker-js/faker';

export const seedStore = (store: Store) => {
	store.setState(state => {
		const users = [
			...new Array<User>(parseInt(process.env.FAKE_USERS_AMOUNT ?? '100', 10)),
		].map(() => createFakeUser());

		const posts = [
			...new Array<Post>(parseInt(process.env.FAKE_POSTS_AMOUNT ?? '200', 10)),
		].map(() =>
			createFakePost({
				ownerId: users[faker.number.int({ min: 0, max: users.length - 1 })].id,
				dislikes: getRandomsFromArray(users.map(user => user.id)),
				likes: getRandomsFromArray(users.map(user => user.id)),
			}),
		);

		const comments = [
			...new Array<Comment>(
				parseInt(process.env.FAKE_COMMENTS_AMOUNT ?? '400', 10),
			),
		].map(() => {
			const replies = [
				...new Array<UUID>(faker.number.int({ min: 1, max: 5 })),
			].map(
				() =>
					createFakeComment({
						ownerId: getRandomFromArray(users).id,
						postId: getRandomFromArray(posts).id,
						replies: [],
						dislikes: getRandomsFromArray(users.map(user => user.id)),
						likes: getRandomsFromArray(users.map(user => user.id)),
					}).id,
			);

			return createFakeComment({
				ownerId: getRandomFromArray(users).id,
				postId: getRandomFromArray(posts).id,
				replies,
				dislikes: getRandomsFromArray(users.map(user => user.id)),
				likes: getRandomsFromArray(users.map(user => user.id)),
			});
		});

		return { ...state, users, posts, comments };
	});
};
