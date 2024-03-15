import { type UUID } from 'crypto';

export type User = {
	id: UUID;
	profilePicture: string;
	username: string;
	email: string;
	password: string;
	createdAt: string;
	updatedAt: string;
};
