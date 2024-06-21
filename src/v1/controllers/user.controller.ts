import { type Request, type ResponseToolkit } from '@hapi/hapi';
import { type UUID } from 'node:crypto';
import {
	type MetaData,
	type ApiResponse,
	type UserCreate,
	type UserEdit,
	type UserWithoutPassword,
	type UpdateUserPassword,
} from 'src/v1/models';
import { userService } from 'src/v1/services';

export const userController = {
	addUser(req: Request, h: ResponseToolkit) {
		const user = userService.addUser(req.payload as UserCreate);

		const response: ApiResponse<{ user: UserWithoutPassword }> = {
			statusCode: 201,
			message: 'User created successfully',
			data: { user },
		};

		return h.response(response).code(201);
	},

	getUsers(req: Request, h: ResponseToolkit) {
		const query = req.query as { keyword: string; page: number; limit: number };

		const { data: users, metadata } = userService.getUsers(
			query.keyword,
			query.limit,
			query.page,
		);

		const response: ApiResponse<{
			users: UserWithoutPassword[];
			metadata: MetaData;
		}> = {
			statusCode: 200,
			message: 'Users fetched successfully',
			data: { users, metadata },
		};

		return h.response(response).code(200);
	},

	getUserById(req: Request, h: ResponseToolkit) {
		const params = req.params as { id: UUID };

		const user = userService.getUserById(params.id);

		const response: ApiResponse<{ user: UserWithoutPassword }> = {
			statusCode: 200,
			message: 'User fetched successfully',
			data: { user },
		};

		return h.response(response).code(200);
	},

	getUserByUsername(req: Request, h: ResponseToolkit) {
		const params = req.params as { username: string };

		const user = userService.getUserByUsername(params.username);

		const response: ApiResponse<{ user: UserWithoutPassword }> = {
			statusCode: 200,
			message: 'User fetched successfully',
			data: { user },
		};

		return h.response(response).code(200);
	},

	updateUser(req: Request, h: ResponseToolkit) {
		const params = req.params as { id: UUID };

		const user = userService.updateUser(params.id, req.payload as UserEdit);

		const response: ApiResponse<{ user: UserWithoutPassword }> = {
			statusCode: 200,
			message: 'User updated successfully',
			data: { user },
		};

		return h.response(response).code(200);
	},

	updateUserPassword(req: Request, h: ResponseToolkit) {
		const params = req.params as { id: UUID };
		const { oldPassword, newPassword } = req.payload as UpdateUserPassword;

		const userId = userService.updateUserPassword(
			params.id,
			oldPassword,
			newPassword,
		);

		const response: ApiResponse<{ userId: UUID }> = {
			statusCode: 200,
			message: 'User password updated successfully',
			data: { userId },
		};

		return h.response(response).code(200);
	},

	deleteUser(req: Request, h: ResponseToolkit) {
		const params = req.params as { id: UUID };

		const userId = userService.deleteUser(params.id);

		const response: ApiResponse<{ userId: UUID }> = {
			statusCode: 200,
			message: 'User deleted successfully',
			data: { userId },
		};

		return h.response(response).code(200);
	},
};
