import { type UUID } from 'crypto';

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

export type CommentCreate = Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>;
export type CommentEdit = Omit<
	Comment,
	'id' | 'owner' | 'post' | 'createdAt' | 'updatedAt'
>;
