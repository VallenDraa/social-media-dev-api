import { type Request, type ResponseToolkit } from '@hapi/hapi';
import { type UUID } from 'node:crypto';
import {
	type FriendsList,
	type ApiResponse,
	type FriendshipDataDetail,
	type MetaData,
} from 'src/models';
import { friendService } from 'src/services';

export const friendController = {
	addFriend(req: Request, h: ResponseToolkit) {
		const { userId, friendId } = req.params as { userId: UUID; friendId: UUID };

		friendService.addFriend(userId, friendId);

		const response: ApiResponse<{ friendId: UUID }> = {
			statusCode: 201,
			message: 'Friend added successfully',
			data: { friendId },
		};

		return h.response(response).code(201);
	},

	removeFriend(req: Request, h: ResponseToolkit) {
		const { userId, friendId } = req.params as { userId: UUID; friendId: UUID };

		friendService.removeFriend(userId, friendId);

		const response: ApiResponse<{ friendId: UUID }> = {
			statusCode: 200,
			message: 'Friend removed successfully',
			data: { friendId },
		};

		return h.response(response).code(200);
	},

	getFriends(req: Request, h: ResponseToolkit) {
		const { userId } = req.params as { userId: UUID };
		const query = req.query as {
			page: number;
			limit: number;
			'with-user-data': boolean;
		};

		const { friendsList, metadata } = friendService.getFriends({
			userId,
			limit: query.limit,
			page: query.page,
			withUserData: query['with-user-data'],
		});

		const response: ApiResponse<{
			friendsList: FriendsList | FriendsList<FriendshipDataDetail>;
			metadata: MetaData;
		}> = {
			statusCode: 200,
			message: 'Friends fetched successfully',
			data: { friendsList, metadata },
		};

		return h.response(response).code(200);
	},
};
