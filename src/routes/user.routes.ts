import { type ServerRoute } from '@hapi/hapi';
import { userController } from 'src/controllers';
import { failAction } from 'src/utils/fail-action-response';
import { idValidator, paginateValidator } from 'src/validators';
import {
	createUserValidator,
	editUserPasswordValidator,
	editUserValidator,
} from 'src/validators/user.validator';

export const userRoutes: ServerRoute[] = [
	{
		path: '/users',
		method: 'GET',
		options: {
			validate: {
				failAction,
				query: paginateValidator,
			},
		},
		handler: userController.getUsers,
	},
	{
		path: '/users/{id}',
		method: 'GET',
		handler: userController.getUserById,
	},
	{
		path: '/users',
		method: 'POST',
		options: {
			validate: {
				failAction,
				payload: createUserValidator,
			},
		},
		handler: userController.addUser,
	},
	{
		path: '/users/{id}',
		method: 'PUT',
		options: {
			validate: {
				failAction,
				params: idValidator,
				payload: editUserValidator,
			},
		},
		handler: userController.updateUser,
	},
	{
		path: '/users/{id}/password',
		method: 'PUT',
		options: {
			validate: {
				failAction,
				params: idValidator,
				payload: editUserPasswordValidator,
			},
		},
		handler: userController.updateUserPassword,
	},
	{
		path: '/users/{id}',
		method: 'DELETE',
		options: {
			validate: {
				failAction,
				params: idValidator,
			},
		},
		handler: userController.deleteUser,
	},
];
