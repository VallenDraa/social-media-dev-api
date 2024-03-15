export type Post = {
	id: string;
	description: string;
	images: string[];
	owner: string;
	likes: string[];
	dislikes: string[];
	createdAt: string;
	updatedAt: string;
};

export type PostCreate = Omit<Post, 'id'>;
