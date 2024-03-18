import { type Request, type ResponseToolkit } from '@hapi/hapi';
import {
	type Login,
	type ApiResponse,
	type UserWithoutPassword,
	type AccessToken,
	type RegisterData,
} from 'src/models';
import { authService } from 'src/services/auth.service';

export const authController = {
	login(request: Request, h: ResponseToolkit) {
		const loginData = request.payload as Login;

		const token = authService.login(loginData);
		const response: ApiResponse<{ token: string }> = {
			statusCode: 200,
			message: 'Login successful',
			data: { token },
		};

		return h.response(response);
	},

	register(request: Request, h: ResponseToolkit) {
		const registerData = request.payload as RegisterData;

		authService.register(registerData);
		const response: ApiResponse<null> = {
			statusCode: 201,
			message: 'Registration successful',
			data: null,
		};

		return h.response(response).code(201);
	},

	me(request: Request, h: ResponseToolkit) {
		const { sub } = request.auth.credentials as AccessToken;

		const user = authService.me(sub);
		const response: ApiResponse<{ user: UserWithoutPassword }> = {
			statusCode: 200,
			message: 'Successfully get current user details',
			data: { user },
		};

		return h.response(response);
	},
};
