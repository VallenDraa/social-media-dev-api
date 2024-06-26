import { type UUID } from 'node:crypto';

export type Post = {
	id: UUID;
	description: string;
	images: string[];
	owner: UUID;
	likes: UUID[];
	dislikes: UUID[];
	createdAt: string;
	updatedAt: string;
};

export type PostDetail = Post & {
	comments: UUID[];
};

export type PostCreate = Omit<
	Post,
	'id' | 'likes' | 'dislikes' | 'owner' | 'createdAt' | 'updatedAt'
>;
export type PostEdit = Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'owner'>;
