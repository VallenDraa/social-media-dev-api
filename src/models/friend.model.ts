import { type UUID } from 'node:crypto';

export type FriendsList = {
	userId: UUID;
	list: Array<{ id: UUID; friendsSince: string }>;
	createdAt: string;
	updatedAt: string;
};
