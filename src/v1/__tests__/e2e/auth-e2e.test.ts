import {
	type ErrorApiResponse,
	type ApiResponse,
	type Login,
	type UserWithoutPassword,
	type RegisterData,
} from 'src/v1/models';
import request from 'supertest';
import { createServer } from 'src/server';
import jwt from 'jsonwebtoken';
import { registerDataMock } from 'src/v1/__tests__/mocks';
import type TestAgent from 'supertest/lib/agent';
import { type Server } from '@hapi/hapi';
import { dataStore } from 'src/v1/store';
import {
	ACCESS_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_NAME,
} from 'src/v1/utils/jwt';

describe('Auth e2e', () => {
	let agent: TestAgent;
	let serverListener: Server['listener'];

	beforeAll(async () => {
		serverListener = (await createServer(true)).listener.listen();
		agent = request(serverListener);
	});

	afterAll(() => serverListener.close());

	const getCookie = (response: request.Response, cookieName: string) =>
		(response.header['set-cookie'] as unknown as string[])
			.find(cookie => cookie.startsWith(cookieName))
			?.split(';')[0];

	const getTokens = async () =>
		agent
			.post('/api/v1/auth/login')
			.send({ email: 'fake@gmail.com', password: 'fake1234567' })
			.then(response => {
				const body = response.body as ApiResponse<{
					accessToken: string;
					refreshToken: string;
				}>;

				const refreshTokenCookie = getCookie(
					response,
					REFRESH_TOKEN_COOKIE_NAME,
				);
				const accessTokenCookie = getCookie(response, ACCESS_TOKEN_COOKIE_NAME);

				return {
					accessToken: body.data.accessToken,
					refreshToken: body.data.refreshToken,
					accessTokenCookie,
					refreshTokenCookie,
				};
			});

	describe('POST /auth/register', () => {
		const sendRegisterData = (data: object, status: number) =>
			agent
				.post('/api/v1/auth/register')
				.send(data)
				.expect(status)
				.expect('Content-Type', /json/);

		it('Should register new user, creates new user friendsList, and return 201 status code', async () => {
			await sendRegisterData(registerDataMock, 201).then(response => {
				const body = response.body as ApiResponse<{
					user: UserWithoutPassword;
				}>;

				expect(body.message).toStrictEqual('Registration successful');
				expect(body.statusCode).toStrictEqual(201);
			});

			const { friendsList, users } = dataStore.getState();
			const user = users.find(entry => entry.email === registerDataMock.email)!;
			const userFriendsList = friendsList.find(
				entry => entry.userId === user.id,
			);

			// Check if friendsList is created
			expect(userFriendsList).toBeDefined();
			expect(userFriendsList!.createdAt).toStrictEqual(user.createdAt);
			expect(userFriendsList!.updatedAt).toStrictEqual(user.createdAt);
			expect(userFriendsList!.list.length).toStrictEqual(0);
		});

		it('Should return 400 status code when there is a duplicate user in the database', async () => {
			await sendRegisterData(registerDataMock, 400)
				.expect('Content-Type', /json/)
				.then(response => {
					const body = response.body as ErrorApiResponse;

					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('User already exists');
					expect(body.statusCode).toStrictEqual(400);
				});
		});

		it('Should return 400 status code if missing required fields', async () => {
			// Missing username
			await sendRegisterData(
				{
					email: 'fake@gmail.com',
					confirmPassword: 'fake123456',
					password: 'fake123456',
				},
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Username is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});

			// Missing email
			await sendRegisterData(
				{
					username: 'fake',
					confirmPassword: 'fake123456',
					password: 'fake123456',
				},
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Email is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});

			// Missing password
			await sendRegisterData(
				{
					username: 'fake',
					email: 'fake@gmail.com',
					confirmPassword: 'fake123456',
				},
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Password is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});

			// Missing password confirmation
			await sendRegisterData(
				{
					username: 'fake',
					email: 'fake@gmail.com',
					password: 'fake123456',
				},
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual(
					'Password confirmation is invalid or missing',
				);
				expect(body.statusCode).toStrictEqual(400);
			});
		});

		it("Should return 400 status code if 'password' and 'confirmPassword' do not match", async () => {
			await sendRegisterData(
				{
					email: 'jono@gmail.com',
					username: 'jono',
					password: 'jono123456',
					confirmPassword: 'jono1234563',
				} as RegisterData,
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual(
					'Password and confirm password do not match',
				);
				expect(body.statusCode).toStrictEqual(400);
			});
		});
	});

	describe('POST /auth/login', () => {
		const loginData: Login = {
			email: 'fake@gmail.com',
			password: 'fake1234567',
		};

		const sendLoginData = (data: object, status: number) =>
			agent
				.post('/api/v1/auth/login')
				.send(data)
				.expect(status)
				.expect('Content-Type', /json/);

		it('Should give access token and refresh token when user login successfully, ', async () => {
			await sendLoginData(loginData, 200).then(response => {
				const body = response.body as ApiResponse<{
					accessToken: string;
					refreshToken: string;
				}>;

				const refreshTokenCookie = getCookie(
					response,
					REFRESH_TOKEN_COOKIE_NAME,
				);
				const accessTokenCookie = getCookie(response, ACCESS_TOKEN_COOKIE_NAME);

				expect(body.statusCode).toStrictEqual(200);
				expect(body.message).toStrictEqual('Login successful');
				expect(typeof refreshTokenCookie).toStrictEqual('string');
				expect(typeof accessTokenCookie).toStrictEqual('string');
				expect(typeof body.data.accessToken).toStrictEqual('string');
				expect(typeof body.data.refreshToken).toStrictEqual('string');
			});
		});

		it('Should return 401 status code if credentials are invalid', async () => {
			await sendLoginData({ ...loginData, password: '231231232' }, 401).then(
				response => {
					const body = response.body as ErrorApiResponse;

					expect(body.error).toStrictEqual('Unauthorized');
					expect(body.message).toStrictEqual('Invalid email or password');
					expect(body.statusCode).toStrictEqual(401);
				},
			);
		});

		it('Should return 400 status code if missing required fields', async () => {
			// Missing email
			await sendLoginData({ password: '123213' }, 400).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Email is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});

			// Missing password
			await sendLoginData({ email: 'fake@gmail.com' }, 400).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Password is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});
		});
	});

	describe('GET /auth/me', () => {
		const sendMeRequest = (status: number, accessToken?: string) => {
			const req = agent.get('/api/v1/auth/me');

			if (accessToken) {
				void req.set('Authorization', `Bearer ${accessToken}`);
			}

			return req.expect(status).expect('Content-Type', /json/);
		};

		it("Should return 401 when access token in header isn't provided", async () => {
			await sendMeRequest(401).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Unauthorized');
				expect(body.message).toStrictEqual('Missing authentication');
				expect(body.statusCode).toStrictEqual(401);
			});
		});

		it('Should return 401 when access token in header is invalid or expired', async () => {
			// Invalid token
			await sendMeRequest(401, 'invalid-token').then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Unauthorized');
				expect(body.message).toStrictEqual('Missing authentication');
				expect(body.statusCode).toStrictEqual(401);
			});

			// Create expired token
			const expiredToken = await agent
				.post('/api/v1/auth/login')
				.send({ email: 'fake@gmail.com', password: 'fake1234567' })
				.then(({ body }) => {
					const { accessToken } = (body as ApiResponse<{ accessToken: string }>)
						.data;

					const userId = jwt.decode(accessToken)!.sub as string;
					return jwt.sign({}, process.env.ACCESS_TOKEN_SECRET, {
						subject: userId,
						expiresIn: '0s',
					});
				});

			// Expired token
			await sendMeRequest(401, expiredToken).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Unauthorized');
				expect(body.message).toStrictEqual('Expired token');
				expect(body.statusCode).toStrictEqual(401);
			});
		});

		it('Should return user details when access token is valid', async () => {
			const accessToken = await agent
				.post('/api/v1/auth/login')
				.send({ email: 'fake@gmail.com', password: 'fake1234567' })
				.then(
					({ body }) =>
						(body as ApiResponse<{ accessToken: string }>).data.accessToken,
				);

			await sendMeRequest(200, accessToken).then(response => {
				const body = response.body as ApiResponse<{
					user: UserWithoutPassword;
				}>;

				expect(body.statusCode).toStrictEqual(200);
				expect(body.message).toStrictEqual(
					'Successfully get current user details',
				);
				expect(Object.keys(body.data.user)).toStrictEqual([
					'id',
					'email',
					'username',
					'profilePicture',
					'createdAt',
					'updatedAt',
				]);
			});
		});
	});

	describe('POST /auth/refresh-token', () => {
		it("Should return 401 status code if 'refreshToken' from payload is invalid or expired", async () => {
			const userId = jwt.decode((await getTokens()).accessToken)!.sub as string;
			const expiredRefreshToken = jwt.sign(
				{},
				process.env.REFRESH_TOKEN_SECRET,
				{ subject: userId, expiresIn: '0s' },
			);

			await agent
				.get('/api/v1/auth/refresh-token')
				.set('Authorization', `Bearer ${expiredRefreshToken}`)
				.then(response => {
					const body = response.body as ErrorApiResponse;

					expect(body.error).toStrictEqual('Unauthorized');
					expect(body.message).toStrictEqual('Refresh token expired');
					expect(body.statusCode).toStrictEqual(401);
				});
		});

		it("Should return new access token if 'refreshToken' from payload is valid", async () => {
			const refreshToken = await getTokens().then(
				tokens => tokens.refreshToken,
			);

			await agent
				.get('/api/v1/auth/refresh-token')
				.set('Authorization', `Bearer ${refreshToken}`)
				.expect(200)
				.then(response => {
					const body = response.body as ApiResponse<{ accessToken: string }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual(
						'Successfully refreshed access token',
					);
					expect(typeof body.data.accessToken).toStrictEqual('string');
				});
		});
	});

	describe('GET /auth/refresh-token/cookie', () => {
		it("Should return 401 status code if 'refreshToken' from cookie is invalid or expired", async () => {
			const userId = jwt.decode((await getTokens()).accessToken)!.sub as string;
			const expiredRefreshToken = jwt.sign(
				{},
				process.env.REFRESH_TOKEN_SECRET,
				{ subject: userId, expiresIn: '0s' },
			);

			await agent
				.get('/api/v1/auth/refresh-token/cookie')
				.set('Cookie', [`${REFRESH_TOKEN_COOKIE_NAME}=${expiredRefreshToken}`])
				.expect(401)
				.then(response => {
					const body = response.body as ErrorApiResponse;

					expect(body.error).toStrictEqual('Unauthorized');
					expect(body.message).toStrictEqual('Refresh token expired');
					expect(body.statusCode).toStrictEqual(401);
				});
		});

		it("Should return new access token if 'refreshToken' from cookie is valid", async () => {
			const refreshTokenCookie = await getTokens().then(
				tokens => tokens.refreshTokenCookie,
			);

			await agent
				.get('/api/v1/auth/refresh-token/cookie')
				.set('Cookie', [refreshTokenCookie!])
				// .expect(200)
				.then(response => {
					const body = response.body as ApiResponse<{ accessToken: string }>;

					// Expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual(
						'Successfully refreshed access token',
					);
					// Expect(typeof body.data.accessToken).toStrictEqual('string');
				});
		});
	});
});
