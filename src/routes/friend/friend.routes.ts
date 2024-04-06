import { type ServerRoute } from '@hapi/hapi';
import { friendController } from 'src/controllers';
import { failAction } from 'src/utils/fail-action-response';
import {
	friendRequestValidator,
	searchFriendValidator,
	userIdValidator,
} from 'src/validators';
import { friendSwagger } from './friend.swagger';

export const friendRoutes: ServerRoute[] = [
	{
		path: '/users/{userId}/friends',
		method: 'GET',
		options: {
			description: 'Get all friends of a user.',
			notes: 'Gets all friends of a user in a paginated manner.',
			tags: ['api', 'friends'],
			plugins: { 'hapi-swagger': friendSwagger['GET /users/{userId}/friends'] },
			validate: {
				failAction,
				params: userIdValidator,
				query: searchFriendValidator,
			},
		},
		handler: friendController.getFriends,
	},
	{
		path: '/users/{userId}/friends/{friendId}',
		method: 'POST',
		options: {
			description: 'Add a single friend.',
			notes: 'Adds a single friend to the friends list of a user.',
			tags: ['api', 'friends'],
			plugins: {
				'hapi-swagger':
					friendSwagger['POST /users/{userId}/friends/{friendId}'],
			},
			validate: { failAction, params: friendRequestValidator },
		},
		handler: friendController.addFriend,
	},
	{
		path: '/users/{userId}/friends/{friendId}',
		method: 'DELETE',
		options: {
			description: 'Remove a single friend.',
			notes: 'Removes a single friend to the friends list of a user.',
			tags: ['api', 'friends'],
			plugins: {
				'hapi-swagger':
					friendSwagger['DELETE /users/{userId}/friends/{friendId}'],
			},
			validate: { failAction, params: friendRequestValidator },
		},
		handler: friendController.removeFriend,
	},
];
