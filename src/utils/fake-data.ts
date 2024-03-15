import { type User, type Comment, type Post } from '../models';
import { type UUID } from 'crypto';
import { faker } from '@faker-js/faker';

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

export const createFakePost = ({
	ownerId,
	likes,
	dislikes,
}: {
	ownerId: UUID;
	likes: UUID[];
	dislikes: UUID[];
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

export const createFakeComment = ({
	postId,
	ownerId,
	likes,
	dislikes,
	replies,
}: {
	postId: UUID;
	ownerId: UUID;
	likes: UUID[];
	dislikes: UUID[];
	replies: UUID[];
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
