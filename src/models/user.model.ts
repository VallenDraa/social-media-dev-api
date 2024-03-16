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

export type UserWithoutPassword = Omit<User, 'password'>;

export type UserCreate = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UserEdit = Omit<
	User,
	'id' | 'password' | 'createdAt' | 'updatedAt'
>;

export type UpdateUserPassword = {
	oldPassword: string;
	newPassword: string;
};
