import { type Request, type ResponseToolkit } from '@hapi/hapi';
import {
	type Login,
	type ApiResponse,
	type UserWithoutPassword,
	type AccessToken,
	type RegisterData,
	type RefreshTokenPayload,
} from 'src/v1/models';
import { authService } from 'src/v1/services';
import {
	REFRESH_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_OPTIONS,
} from '../utils/jwt';

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

		return (
			h
				.response(response)
				// Set refresh token cookie
				.state(
					REFRESH_TOKEN_COOKIE_NAME,
					refreshToken,
					REFRESH_TOKEN_COOKIE_OPTIONS,
				)
		);
	},

	logout(_request: Request, h: ResponseToolkit) {
		const response: ApiResponse<null> = {
			statusCode: 200,
			message: 'Logout successful',
			data: null,
		};

		return h.response(response).unstate(REFRESH_TOKEN_COOKIE_NAME);
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
		const payloadRefreshToken = (request.payload as RefreshTokenPayload)
			?.refreshToken as string | undefined;
		const cookieRefreshToken = (request.state as { refreshToken?: string })?.[
			REFRESH_TOKEN_COOKIE_NAME
		];

		const newAccessToken = authService.refreshToken({
			cookieRefreshToken,
			payloadRefreshToken,
		});

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
