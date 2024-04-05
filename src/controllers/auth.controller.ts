import { type Request, type ResponseToolkit } from '@hapi/hapi';
import {
	type Login,
	type ApiResponse,
	type UserWithoutPassword,
	type AccessToken,
	type RegisterData,
	type RefreshTokenPayload,
} from 'src/models';
import { authService } from 'src/services';

export const authController = {
	login(request: Request, h: ResponseToolkit) {
		const loginData = request.payload as Login;

		const { accessToken, refreshToken } = authService.login(loginData);
		const response: ApiResponse<{ accessToken: string; refreshToken: string }> =
			{
				statusCode: 200,
				message: 'Login successful',
				data: { accessToken, refreshToken },
			};

		return h.response(response);
	},

	register(request: Request, h: ResponseToolkit) {
		const registerData = request.payload as RegisterData;

		const newUser = authService.register(registerData);
		const response: ApiResponse<{ user: UserWithoutPassword }> = {
			statusCode: 201,
			message: 'Registration successful',
			data: { user: newUser },
		};

		return h.response(response).code(201);
	},

	refreshToken(request: Request, h: ResponseToolkit) {
		const { refreshToken } = request.payload as RefreshTokenPayload;
		const newAccessToken = authService.refreshToken(refreshToken);

		const response: ApiResponse<{ accessToken: string }> = {
			statusCode: 200,
			message: 'Successfully refreshed access token',
			data: { accessToken: newAccessToken },
		};

		return h.response(response);
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
