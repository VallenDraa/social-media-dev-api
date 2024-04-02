import { type UUID } from 'node:crypto';

export type Comment = {
	id: UUID;
	content: string;
	post: UUID;
	owner: UUID;
	likes: UUID[];
	dislikes: UUID[];
	replies: UUID[];
	createdAt: string;
	updatedAt: string;
};

export type CommentCreate = Omit<
	Comment,
	'id' | 'post' | 'likes' | 'dislikes' | 'replies' | 'createdAt' | 'updatedAt'
>;
export type CommentEdit = Omit<
	Comment,
	'id' | 'owner' | 'post' | 'createdAt' | 'updatedAt'
>;
