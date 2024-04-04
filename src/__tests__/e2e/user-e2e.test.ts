import request from 'supertest';
import {
	type MetaData,
	type User,
	type ApiResponse,
	type Login,
	type UserWithoutPassword,
	type ErrorApiResponse,
	type UserCreate,
	type UserEdit,
	type UpdateUserPassword,
} from 'src/models';
import { createServer } from 'src/server';
import { registerDataMock } from 'src/__tests__/mocks';
import { type TestCase } from 'src/__tests__/types';
import crypto from 'node:crypto';
import type TestAgent from 'supertest/lib/agent';
import { type Server } from '@hapi/hapi';

describe('User e2e', () => {
	let agent: TestAgent;
	let serverListener: Server['listener'];
	let accessToken: string;
	let fakeUser: UserWithoutPassword;
	const OLD_ENV = process.env;

	beforeAll(async () => {
		process.env = {
			...OLD_ENV,
			FAKE_COMMENT_AMOUNT: '10',
			FAKE_POST_AMOUNT: '10',
			FAKE_USER_AMOUNT: '10',
		};

		serverListener = (await createServer(true)).listener.listen();
		agent = request(serverListener);

		// Register fake user
		await agent.post('/auth/register').send(registerDataMock);

		// Get accesss token of fake user
		accessToken = await agent
			.post('/auth/login')
			.send({
				email: registerDataMock.email,
				password: registerDataMock.password,
			} as Login)
			.then(
				res =>
					(res.body as ApiResponse<{ accessToken: string }>).data.accessToken,
			);

		// Get fake user detail
		fakeUser = await agent
			.get('/auth/me')
			.set('Authorization', `Bearer ${accessToken}`)
			.then(
				res =>
					(res.body as ApiResponse<{ user: UserWithoutPassword }>).data.user,
			);
	});

	afterAll(() => serverListener.close());

	const getUsers = (page?: number | string, limit?: number | string) => {
		const query = new URLSearchParams();

		if (page) {
			query.set('page', page.toString());
		}

		if (limit) {
			query.set('limit', limit.toString());
		}

		return agent
			.get(`/users?${query.toString()}`)
			.set('Authorization', `Bearer ${accessToken}`);
	};

	const getValidUser = async () =>
		((await getUsers()).body as ApiResponse<{ users: UserWithoutPassword[] }>)
			.data.users[0];

	describe('GET /users', () => {
		it('Should return first page with 10 users when no query is provided', async () => {
			await getUsers()
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						users: UserWithoutPassword[];
						metadata: MetaData;
					}>;

					expect(body.data.users).toHaveLength(10);
					expect(body.data.metadata.currentPage).toStrictEqual(1);
				});
		});

		it('Should return second page with 5 users per page', async () => {
			await getUsers(2, 5)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						users: UserWithoutPassword[];
						metadata: MetaData;
					}>;

					expect(body.data.users).toHaveLength(5);
					expect(body.data.metadata.currentPage).toStrictEqual(2);
				});
		});

		it('Should return empty array when page query is more than the total pages', async () => {
			await getUsers(1000)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						users: UserWithoutPassword[];
						metadata: MetaData;
					}>;

					expect(body.data.users).toHaveLength(0);
					expect(body.data.metadata.currentPage).toStrictEqual(1000);
					expect(body.data.metadata.lastPage).toBeLessThan(1000);
				});
		});

		it('Should return 400 when page or limit query is not a number', async () => {
			// Invalid page
			await getUsers('a')
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.message).toStrictEqual('"page" must be a number');
				});

			// Invalid limit
			await getUsers(1, 'b')
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.message).toStrictEqual('"limit" must be a number');
				});
		});
	});

	describe('POST /users', () => {
		const addUser = (newUser: Partial<UserCreate>) =>
			agent
				.post('/users')
				.send(newUser)
				.set('Authorization', `Bearer ${accessToken}`);

		it('Should return 201 when user is created successfully', async () => {
			const newUser: UserCreate = {
				email: 'dude@gmail.com',
				profilePicture: 'https://image.com/image.jpg',
				username: 'dude',
				password: 'password12345',
			};

			await addUser(newUser)
				.expect(201)
				.then(res => {
					const body = res.body as ApiResponse<{ user: User }>;

					expect(body.statusCode).toStrictEqual(201);
					expect(body.message).toStrictEqual('User created successfully');
				});
		});

		it('Should return 400 when there are missing fields', async () => {
			const testCases: Array<TestCase<Partial<UserCreate>, ErrorApiResponse>> =
				[
					{
						input: {
							password: '123',
							profilePicture: 'image.jpg',
							username: 'username',
						},
						expected: {
							statusCode: 400,
							message: 'Email is invalid or missing',
							error: 'Bad Request',
						},
					},
					{
						input: {
							email: 'john@gmail.com',
							profilePicture: 'image.jpg',
							username: 'username',
						},
						expected: {
							statusCode: 400,
							message: 'Password is invalid or missing',
							error: 'Bad Request',
						},
					},
					{
						input: {
							email: 'john@gmail.com',
							password: '123',
							username: 'username',
						},
						expected: {
							statusCode: 400,
							message: 'Profile picture is invalid or missing',
							error: 'Bad Request',
						},
					},
					{
						input: {
							email: 'john@gmail.com',
							password: '123',
							profilePicture: 'image.jpg',
						},
						expected: {
							statusCode: 400,
							message: 'Username is invalid or missing',
							error: 'Bad Request',
						},
					},
				];

			testCases.forEach(async ({ input, expected }) => {
				await addUser(input)
					.expect(400)
					.then(res => {
						const body = res.body as ErrorApiResponse;

						expect(body.statusCode).toStrictEqual(expected.statusCode);
						expect(body.error).toStrictEqual(expected.error);
						expect(body.message).toStrictEqual(expected.message);
					});
			});
		});
	});

	describe('GET /users/:id', () => {
		const getUserById = (id: string) =>
			agent.get(`/users/${id}`).set('Authorization', `Bearer ${accessToken}`);

		it('Should return user when found', async () => {
			const validUserId = await agent
				.get('/users')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
				.then(
					res => (res.body as ApiResponse<{ users: User[] }>).data.users[0].id,
				);

			await getUserById(validUserId)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ user: User }>;
					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('User fetched successfully');
					expect(body.data.user.id).toStrictEqual(validUserId);
				});
		});

		it('Should return 404 when user is not found', async () => {
			const invalidId = crypto.randomUUID();

			await getUserById(invalidId)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('User not found!');
				});
		});
	});

	describe('PUT /users/:id', () => {
		const updateUser = (userId: string, user: Partial<UserEdit>) =>
			agent
				.put(`/users/${userId}`)
				.send(user)
				.set('Authorization', `Bearer ${accessToken}`);

		it('Should return 200 when user is updated successfully', async () => {
			const validUser = await getValidUser();

			await updateUser(validUser.id, {
				email: 'bro@gmail.com',
				profilePicture: 'https://image.com/image.jpg',
				username: 'bro',
			})
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ user: User }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('User updated successfully');
				});
		});

		it('Should return 404 when user is not found', async () => {
			const invalidId = crypto.randomUUID();

			await updateUser(invalidId, {
				email: 'bro@gmail.com',
				profilePicture: 'https://image.com/image.jpg',
				username: 'bro',
			})
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('User not found!');
				});
		});

		it('Should return 400 when there are missing fields', async () => {
			const validUser = await getValidUser();

			const testCases: Array<TestCase<Partial<UserEdit>, ErrorApiResponse>> = [
				{
					input: {
						profilePicture: 'image.jpg',
						username: 'username',
					},
					expected: {
						statusCode: 400,
						message: 'Email is invalid or missing',
						error: 'Bad Request',
					},
				},
				{
					input: {
						email: 'user@gmail.com',
						username: 'username',
					},
					expected: {
						statusCode: 400,
						message: 'Profile picture is invalid or missing',
						error: 'Bad Request',
					},
				},
				{
					input: {
						email: 'user@gmail.com',
						profilePicture: 'image.jpg',
					},
					expected: {
						statusCode: 400,
						message: 'Username is invalid or missing',
						error: 'Bad Request',
					},
				},
			];

			testCases.forEach(async ({ input, expected }) => {
				await updateUser(validUser.id, input)
					.expect(400)
					.then(res => {
						const body = res.body as ErrorApiResponse;

						expect(body.statusCode).toStrictEqual(expected.statusCode);
						expect(body.error).toStrictEqual(expected.error);
						expect(body.message).toStrictEqual(expected.message);
					});
			});
		});
	});

	describe('PUT /users/:id/password', () => {
		const updateUserPassword = (
			userId: string,
			data: Partial<UpdateUserPassword>,
		) =>
			agent
				.put(`/users/${userId}/password`)
				.set('Authorization', `Bearer ${accessToken}`)
				.send(data);

		it('Should return 400 when old password and new password is the same', async () => {
			await updateUserPassword(fakeUser.id, {
				oldPassword: registerDataMock.password,
				newPassword: registerDataMock.password,
			}).then(res => {
				const body = res.body as ErrorApiResponse;

				expect(body.statusCode).toStrictEqual(400);
				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual(
					'The new password must be different from the old password!',
				);
			});
		});

		it('Should return 401 when password confirmation is wrong', async () => {
			await updateUserPassword(fakeUser.id, {
				oldPassword: 'wrongPassword',
				newPassword: 'newPassword',
			}).then(res => {
				const body = res.body as ErrorApiResponse;

				expect(body.statusCode).toStrictEqual(401);
				expect(body.error).toStrictEqual('Unauthorized');
				expect(body.message).toStrictEqual('Current password is incorrect!');
			});
		});

		it('Should return 404 when user is not found', async () => {
			const invalidUserId = crypto.randomUUID();

			await updateUserPassword(invalidUserId, {
				oldPassword: 'wrongPassword',
				newPassword: 'newPassword12345',
			}).then(res => {
				const body = res.body as ErrorApiResponse;

				expect(body.statusCode).toStrictEqual(404);
				expect(body.error).toStrictEqual('Not Found');
				expect(body.message).toStrictEqual('User not found!');
			});
		});

		it('Should return 400 when there are missing fields', async () => {
			const validUser = await getValidUser();

			const testCases: Array<
				TestCase<Partial<UpdateUserPassword>, ErrorApiResponse>
			> = [
				{
					input: {
						newPassword: 'password12345',
					},
					expected: {
						statusCode: 400,
						message: 'Old password is invalid or missing',
						error: 'Bad Request',
					},
				},
				{
					input: {
						oldPassword: 'password12345',
					},
					expected: {
						statusCode: 400,
						message: 'New password is invalid or missing',
						error: 'Bad Request',
					},
				},
			];

			testCases.forEach(async ({ input, expected }) => {
				await updateUserPassword(validUser.id, input)
					.expect(400)
					.then(res => {
						const body = res.body as ErrorApiResponse;

						expect(body.statusCode).toStrictEqual(expected.statusCode);
						expect(body.error).toStrictEqual(expected.error);
						expect(body.message).toStrictEqual(expected.message);
					});
			});
		});

		it("Should return 200 when user's password is updated successfully", async () => {
			await updateUserPassword(fakeUser.id, {
				oldPassword: registerDataMock.password,
				newPassword: 'newPassword12345',
			}).then(res => {
				const body = res.body as ApiResponse<null>;

				expect(body.statusCode).toStrictEqual(200);
				expect(body.message).toStrictEqual(
					'User password updated successfully',
				);
			});
		});
	});

	describe('DELETE /users/:id', () => {
		const deleteUserById = (id: string) =>
			agent
				.delete(`/users/${id}`)
				.set('Authorization', `Bearer ${accessToken}`);

		it('Should delete user when found', async () => {
			const validUser = await getValidUser();

			await deleteUserById(validUser.id)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ userId: string }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('User deleted successfully');
					expect(body.data.userId).toStrictEqual(validUser.id);
				});
		});

		it('Should return 404 when user is not found', async () => {
			const invalidId = crypto.randomUUID();

			await deleteUserById(invalidId)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('User not found!');
				});
		});
	});
});
