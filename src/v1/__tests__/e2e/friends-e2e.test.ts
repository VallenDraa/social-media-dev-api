import { type Server } from '@hapi/hapi';
import {
	type Login,
	type ApiResponse,
	type UserWithoutPassword,
	type FriendsList,
	type MetaData,
	type FriendshipDataDetail,
	type ErrorApiResponse,
} from 'src/v1/models';
import { createServer } from 'src/server';
import type TestAgent from 'supertest/lib/agent';
import { type TestCase } from '../types';
import { registerDataMock } from '../mocks';
import request from 'supertest';
import crypto from 'node:crypto';
import { dataStore } from 'src/v1/store';

describe('Friends e2e', () => {
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
		await agent.post('/api/v1/auth/register').send(registerDataMock);

		// Get accesss token of fake user
		accessToken = await agent
			.post('/api/v1/auth/login')
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
			.get('/api/v1/auth/me')
			.set('Authorization', `Bearer ${accessToken}`)
			.then(
				res =>
					(res.body as ApiResponse<{ user: UserWithoutPassword }>).data.user,
			);
	});

	afterAll(() => serverListener.close());

	describe('GET /users/:userId/friends', () => {
		const getFriends = ({
			userId,
			page,
			limit,
			withUserData = false,
		}: {
			userId: string;
			page?: number | string;
			limit?: number | string;
			withUserData?: boolean | string;
		}) => {
			const query = new URLSearchParams();

			if (page) {
				query.set('page', page.toString());
			}

			if (limit) {
				query.set('limit', limit.toString());
			}

			if (withUserData) {
				query.set('with-user-data', withUserData.toString());
			}

			return agent
				.get(`/api/v1/users/${userId}/friends?${query.toString()}`)
				.set('Authorization', `Bearer ${accessToken}`);
		};

		it('Should return first page with 10 friends when no query is provided', async () => {
			await getFriends({
				userId: fakeUser.id,
				withUserData: false,
			})
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						friendsList: FriendsList | FriendsList<FriendshipDataDetail>;
						metadata: MetaData;
					}>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Friends fetched successfully');
					expect(body.data.metadata.currentPage).toStrictEqual(1);
					expect(body.data.metadata.limit).toStrictEqual(10);
				});
		});

		it('Should return second page with 5 friends per page', async () => {
			await getFriends({
				userId: fakeUser.id,
				withUserData: false,
				limit: 5,
				page: 2,
			})
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						friendsList: FriendsList | FriendsList<FriendshipDataDetail>;
						metadata: MetaData;
					}>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Friends fetched successfully');
					expect(body.data.metadata.currentPage).toStrictEqual(2);
					expect(body.data.metadata.limit).toStrictEqual(5);
				});
		});

		it("Should return with user data if 'with-user-data' query is true", async () => {
			await getFriends({
				userId: fakeUser.id,
				withUserData: true,
			})
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						friendsList: FriendsList<FriendshipDataDetail>;
						metadata: MetaData;
					}>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Friends fetched successfully');
					expect(body.data.metadata.currentPage).toStrictEqual(1);
					expect(body.data.metadata.limit).toStrictEqual(10);

					for (const friend of body.data.friendsList.list) {
						for (const key of [
							'id',
							'profilePicture',
							'username',
							'email',
							'createdAt',
							'updatedAt',
						]) {
							// @ts-expect-error: Don't care about the value type
							expect(friend.user[key]).toBeDefined();
						}
					}
				});
		});

		it('Should return empty array when page query is more than the total pages', async () => {
			await getFriends({
				userId: fakeUser.id,
				withUserData: true,
				page: 10000,
			})
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						friendsList: FriendsList<FriendshipDataDetail>;
						metadata: MetaData;
					}>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Friends fetched successfully');
					expect(body.data.metadata.currentPage).toStrictEqual(10000);
					expect(body.data.friendsList.list.length).toStrictEqual(0);
					expect(body.data.metadata.limit).toStrictEqual(10);
				});
		});

		it('Should return 400 when some queries are invalid', () => {
			const testCases: Array<
				TestCase<
					{
						userId: crypto.UUID;
						limit?: string;
						page?: string;
						'with-user-data'?: boolean | string;
					},
					ErrorApiResponse
				>
			> = [
				{
					input: {
						userId: fakeUser.id,
						limit: '10',
						page: '1',
						'with-user-data': 'dsds',
					},
					expected: {
						statusCode: 400,
						error: 'Bad Request',
						message: '"with-user-data" must be a boolean',
					},
				},
				{
					input: {
						userId: fakeUser.id,
						limit: 'dsds',
						page: '1',
						'with-user-data': true,
					},
					expected: {
						statusCode: 400,
						error: 'Bad Request',
						message: '"limit" must be a number',
					},
				},
				{
					input: {
						userId: fakeUser.id,
						limit: '10',
						page: 'dsdsd',
						'with-user-data': true,
					},
					expected: {
						statusCode: 400,
						error: 'Bad Request',
						message: '"page" must be a number',
					},
				},
			];

			testCases.forEach(async ({ input, expected }) => {
				await getFriends({
					userId: input.userId,
					limit: input.limit,
					page: input.page,
					withUserData: input['with-user-data'],
				}).then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(expected.statusCode);
					expect(body.error).toStrictEqual(expected.error);
					expect(body.message).toStrictEqual(expected.message);
				});
			});
		});

		it("Should return 404 when user id doesn't exist", async () => {
			await getFriends({
				userId: crypto.randomUUID(),
			})
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual(
						'Cannot find friends list from the given user!',
					);
				});
		});
	});

	describe('POST /users/:userId/friends/:friendId', () => {
		const addFriend = (userId: string, friendId: string) =>
			agent
				.post(`/api/v1/users/${userId}/friends/${friendId}`)
				.set('Authorization', `Bearer ${accessToken}`);

		it('Should add a new friend when id is valid', async () => {
			const { users } = dataStore.getState();
			const validUser = users.at(-1)!;

			await addFriend(fakeUser.id, validUser.id)
				.expect(201)
				.then(res => {
					const body = res.body as ApiResponse<{ friendId: crypto.UUID }>;

					expect(body.statusCode).toStrictEqual(201);
					expect(body.message).toStrictEqual('Friend added successfully');
					expect(body.data.friendId).toStrictEqual(validUser.id);
				});
		});

		it('Should return 409 if friend id is already added', async () => {
			const { users } = dataStore.getState();
			const validUser = users.at(-1)!;

			await addFriend(fakeUser.id, validUser.id)
				.expect(409)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(409);
					expect(body.error).toStrictEqual('Conflict');
					expect(body.message).toStrictEqual('This user is already a friend!');
				});
		});

		it("Should return 404 when user id doesn't exist", async () => {
			await addFriend(crypto.randomUUID(), fakeUser.id)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual(
						'Cannot find friends list from the given user!',
					);
				});
		});

		it('Should return 404 when friendId is not found', async () => {
			await addFriend(fakeUser.id, crypto.randomUUID())
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual(
						'User that is to be a new friend cannot be found!',
					);
				});
		});

		it('Should return 400 when userId is invalid', async () => {
			await addFriend('dssdsds', fakeUser.id)
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('"userId" must be a valid GUID');
				});
		});

		it('Should return 400 when friendId is invalid', async () => {
			await addFriend(fakeUser.id, 'dssdsds')
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('"friendId" must be a valid GUID');
				});
		});
	});

	describe('DELETE /users/:userId/friends/:friendId', () => {
		const removeFriend = (userId: string, friendId: string) =>
			agent
				.delete(`/api/v1/users/${userId}/friends/${friendId}`)
				.set('Authorization', `Bearer ${accessToken}`);

		it('Should remove a new friend when id is valid', async () => {
			const { users } = dataStore.getState();
			const validUser = users.at(-1)!;

			await removeFriend(fakeUser.id, validUser.id)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ friendId: crypto.UUID }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Friend removed successfully');
					expect(body.data.friendId).toStrictEqual(validUser.id);
				});
		});

		it('Should return 409 if friend id is already removed', async () => {
			const { users } = dataStore.getState();
			const validUser = users.at(-1)!;

			await removeFriend(fakeUser.id, validUser.id)
				.expect(409)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(409);
					expect(body.error).toStrictEqual('Conflict');
					expect(body.message).toStrictEqual(
						'This user is already not your friend!',
					);
				});
		});

		it("Should return 404 when user id doesn't exist", async () => {
			await removeFriend(crypto.randomUUID(), fakeUser.id)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual(
						'Cannot find friends list from the given user!',
					);
				});
		});

		it('Should return 404 when friendId is not found', async () => {
			await removeFriend(fakeUser.id, crypto.randomUUID())
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual(
						'User that is to be unfriended cannot be found!',
					);
				});
		});

		it('Should return 400 when userId is invalid', async () => {
			await removeFriend('dssdsds', fakeUser.id)
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('"userId" must be a valid GUID');
				});
		});

		it('Should return 400 when friendId is invalid', async () => {
			await removeFriend(fakeUser.id, 'dssdsds')
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('"friendId" must be a valid GUID');
				});
		});
	});
});
