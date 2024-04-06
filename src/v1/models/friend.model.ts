import { type UUID } from 'node:crypto';
import { type UserWithoutPassword } from './user.model';

export type FriendshipData = { id: UUID; friendsSince: string };
export type FriendshipDataDetail = {
	user: UserWithoutPassword;
	friendsSince: string;
};

export type FriendsList<T = FriendshipData> = {
	userId: UUID;
	list: T[];
	createdAt: string;
	updatedAt: string;
};
