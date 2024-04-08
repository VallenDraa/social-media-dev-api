import {
	type User,
	type Comment,
	type Post,
	type UserWithoutPassword,
	type FriendsList,
} from 'src/v1/models';
import crypto from 'node:crypto';
import { faker } from '@faker-js/faker';
import { emptyArray, getRandomsFromArray } from './array-utils';

/**
 * @returns Fake user without password for real API response
 */
export const createFakeUserWithoutPassword = (): UserWithoutPassword => ({
	id: crypto.randomUUID(),
	profilePicture: faker.image.avatar(),
	username: faker.internet.userName(),
	email: faker.internet.email(),
	createdAt: faker.date
		.recent({ days: 30, refDate: new Date('2022-01-01') })
		.toISOString(),
	updatedAt: faker.date
		.recent({ days: 30, refDate: new Date('2023-01-01') })
		.toISOString(),
});

/**
 * @returns Fake user for real API response
 */
export const createFakeUser = (): User => ({
	id: crypto.randomUUID(),
	profilePicture: faker.image.avatar(),
	username: faker.internet.userName(),
	email: faker.internet.email(),
	password: faker.internet.password(),
	createdAt: faker.date
		.recent({ days: 30, refDate: new Date('2022-01-01') })
		.toISOString(),
	updatedAt: faker.date
		.recent({ days: 30, refDate: new Date('2023-01-01') })
		.toISOString(),
});

/**
 * @returns Fake post for real API response
 */
export const createFakePost = ({
	ownerId,
	likes,
	dislikes,
}: {
	ownerId: crypto.UUID;
	likes: crypto.UUID[];
	dislikes: crypto.UUID[];
}): Post => ({
	id: crypto.randomUUID(),
	description: faker.lorem.paragraph(),
	images: [...Array<string>(faker.number.int({ min: 1, max: 5 }))].map(() =>
		faker.image.urlLoremFlickr(),
	),
	owner: ownerId,
	likes,
	dislikes,
	createdAt: faker.date
		.recent({ days: 30, refDate: new Date('2022-01-01') })
		.toISOString(),
	updatedAt: faker.date
		.recent({ days: 30, refDate: new Date('2023-01-01') })
		.toISOString(),
});

/**
 * @returns Fake comment for real API response
 */
export const createFakeComment = ({
	postId,
	ownerId,
	likes,
	dislikes,
	replies,
}: {
	postId: crypto.UUID;
	ownerId: crypto.UUID;
	likes: crypto.UUID[];
	dislikes: crypto.UUID[];
	replies: crypto.UUID[];
}): Comment => ({
	id: crypto.randomUUID(),
	content: faker.lorem.paragraph(),
	likes,
	dislikes,
	post: postId,
	owner: ownerId,
	replies,
	createdAt: faker.date
		.recent({ days: 30, refDate: new Date('2022-01-01') })
		.toISOString(),
	updatedAt: faker.date
		.recent({ days: 30, refDate: new Date('2023-01-01') })
		.toISOString(),
});

/**
 * @returns Fake friends list for real API response
 */
export const createFakeFriendsList = ({
	user,
	friendsPool,
}: {
	user: User | UserWithoutPassword;
	friendsPool: crypto.UUID[];
}): FriendsList => ({
	userId: user.id,
	list: getRandomsFromArray(friendsPool).map(userId => ({
		id: userId,
		friendsSince: faker.date
			.recent({ days: 60, refDate: new Date('2022-06-01') })
			.toISOString(),
	})),
	createdAt: user.createdAt,
	updatedAt: faker.date
		.recent({ days: 30, refDate: new Date('2023-01-01') })
		.toISOString(),
});

/**
 * @returns Fake user without password for swagger example response
 */
export const createFakeUserWithoutPasswordExample =
	createFakeUserWithoutPassword;

/**
 * @returns Fake user for swagger example response
 */
export const createFakeUserExample = createFakeUser;

/**
 * @returns Fake post for swagger example response
 */
export const createFakePostExample = (): Post => ({
	id: crypto.randomUUID(),
	description: faker.lorem.paragraph(),
	images: [...Array<string>(faker.number.int({ min: 1, max: 5 }))].map(() =>
		faker.image.urlLoremFlickr(),
	),
	owner: faker.string.uuid() as crypto.UUID,
	likes: emptyArray(
		faker.number.int({ min: 0, max: 3 }),
		() => faker.string.uuid() as crypto.UUID,
	),
	dislikes: emptyArray(
		faker.number.int({ min: 0, max: 3 }),
		() => faker.string.uuid() as crypto.UUID,
	),
	createdAt: faker.date
		.recent({ days: 30, refDate: new Date('2022-01-01') })
		.toISOString(),
	updatedAt: faker.date
		.recent({ days: 30, refDate: new Date('2023-01-01') })
		.toISOString(),
});

/**
 * @returns Fake comment example for swagger example response
 */
export const createFakeCommentExample = (): Comment => ({
	id: crypto.randomUUID(),
	content: faker.lorem.paragraph(),
	likes: emptyArray(
		faker.number.int({ min: 0, max: 3 }),
		() => faker.string.uuid() as crypto.UUID,
	),
	dislikes: emptyArray(
		faker.number.int({ min: 0, max: 3 }),
		() => faker.string.uuid() as crypto.UUID,
	),
	post: faker.string.uuid() as crypto.UUID,
	owner: faker.string.uuid() as crypto.UUID,
	replies: emptyArray(
		faker.number.int({ min: 0, max: 3 }),
		() => faker.string.uuid() as crypto.UUID,
	),
	createdAt: faker.date
		.recent({ days: 30, refDate: new Date('2022-01-01') })
		.toISOString(),
	updatedAt: faker.date
		.recent({ days: 30, refDate: new Date('2023-01-01') })
		.toISOString(),
});

/**
 * @returns Fake friends list for swagger example response
 */
export const createFakeFriendsListExample = (): FriendsList => ({
	userId: crypto.randomUUID(),
	list: emptyArray(3, () => ({
		id: crypto.randomUUID(),
		friendsSince: faker.date
			.recent({ days: 60, refDate: new Date('2022-06-01') })
			.toISOString(),
	})),
	createdAt: faker.date
		.recent({ days: 60, refDate: new Date('2021-06-01') })
		.toISOString(),
	updatedAt: faker.date
		.recent({ days: 30, refDate: new Date('2023-01-01') })
		.toISOString(),
});
