import { type UUID } from 'crypto';

export type Comment = {
	id: UUID;
	content: string;
	post: UUID;
	owner: UUID;
	likes: UUID[];
	dislikes: UUID[];
	replies: string[];
	createdAt: string;
	updatedAt: string;
};
