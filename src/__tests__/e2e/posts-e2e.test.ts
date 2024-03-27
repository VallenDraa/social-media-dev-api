import request from 'supertest';
import { type Server } from '@hapi/hapi';
import { createServer } from 'src/server';
import {
	type MetaData,
	type Post,
	type ApiResponse,
	type Login,
	type ErrorApiResponse,
	type PostCreate,
	type UserWithoutPassword,
	type PostEdit,
	type PostDetail,
} from 'src/models';
import { registerDataMock } from 'src/__tests__/mocks';
import { type TestCase } from '../types';

describe('Posts e2e', () => {
	let server: Server;
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

		server = await createServer(true);

		// Register fake user
		await request(server.listener)
			.post('/auth/register')
			.send(registerDataMock);

		// Get accesss token of fake user
		accessToken = await request(server.listener)
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
		fakeUser = await request(server.listener)
			.get('/auth/me')
			.set('Authorization', `Bearer ${accessToken}`)
			.then(
				res =>
					(res.body as ApiResponse<{ user: UserWithoutPassword }>).data.user,
			);
	});

	describe('GET /posts', () => {
		const getPosts = ({
			page,
			limit,
			hasComments = false,
			withTopComments = false,
		}: {
			page?: number | string;
			limit?: number | string;
			hasComments?: boolean;
			withTopComments?: boolean;
		}) => {
			const query = new URLSearchParams();

			if (page) {
				query.set('page', page.toString());
			}

			if (limit) {
				query.set('limit', limit.toString());
			}

			if (hasComments) {
				query.set('has-comments', 'true');
			}

			if (withTopComments) {
				query.set('with-top-comments', 'true');
			}

			return request(server.listener)
				.get(`/posts?${query.toString()}`)
				.set('Authorization', `Bearer ${accessToken}`);
		};

		it('Should return first page with 10 posts when no query is not provided', async () => {
			await getPosts({})
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						posts: Post[];
						metadata: MetaData;
					}>;

					expect(body.data.posts).toHaveLength(10);
					expect(body.data.metadata.currentPage).toStrictEqual(1);
				});
		});

		it('Should return second page with 5 posts per page', async () => {
			await getPosts({ page: 2, limit: 5 })
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						posts: Post[];
						metadata: MetaData;
					}>;

					expect(body.data.posts).toHaveLength(5);
					expect(body.data.metadata.currentPage).toStrictEqual(2);
				});
		});

		it('Should return empty array when page query is more than the total pages', async () => {
			await getPosts({ page: 10 })
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						posts: Post[];
						metadata: MetaData;
					}>;

					expect(body.data.posts).toHaveLength(0);
					expect(body.data.metadata.currentPage).toStrictEqual(10);
					expect(body.data.metadata.lastPage).toBeLessThan(10);
				});
		});

		it('Should return 400 when page or limit query is not a number', async () => {
			// Invalid page
			await getPosts({ page: 'a' })
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.message).toStrictEqual('"page" must be a number');
				});

			// Invalid limit
			await getPosts({ limit: 'b' })
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.message).toStrictEqual('"limit" must be a number');
				});
		});

		it("Should only return posts with comments when 'has-comments' query is true", async () => {
			const allPostsAmount = await getPosts({})
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						posts: PostDetail[];
						metadata: MetaData;
					}>;

					return body.data.metadata.total;
				});

			const postsWithCommentsAmount = await getPosts({ hasComments: true })
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						posts: PostDetail[];
						metadata: MetaData;
					}>;

					return body.data.metadata.total;
				});

			expect(postsWithCommentsAmount).toBeLessThan(allPostsAmount);
		});

		it("Should return posts with comments property when 'with-top-comments' query is true", async () => {
			await getPosts({ withTopComments: true })
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						posts: PostDetail[];
						metadata: MetaData;
					}>;

					for (const post of body.data.posts) {
						expect(post).toHaveProperty('comments');
					}
				});
		});

		it('Should only return posts with comments and post should return with the comments field', async () => {
			await getPosts({
				hasComments: true,
				withTopComments: true,
			}).then(res => {
				const body = res.body as ApiResponse<{
					posts: PostDetail[];
					metadata: MetaData;
				}>;

				for (const post of body.data.posts) {
					expect(post).toHaveProperty('comments');
					expect(post.comments).not.toHaveLength(0);
				}
			});
		});
	});

	describe('POST /posts', () => {
		const addPost = (owner: string, newPost: Partial<PostCreate>) =>
			request(server.listener)
				.post(`/users/${owner}/posts`)
				.send(newPost)
				.set('Authorization', `Bearer ${accessToken}`);

		it('Should return 201 when post is created successfully', async () => {
			const newPost: PostCreate = {
				images: ['https://example.com/image.jpg'],
				description: 'This is a test post',
			};

			await addPost(fakeUser.id, newPost)
				.expect(201)
				.then(res => {
					const body = res.body as ApiResponse<{ post: Post }>;
					expect(body.statusCode).toStrictEqual(201);
					expect(body.message).toStrictEqual('Post created successfully');
				});
		});

		it('Should return 400 when there are missing fields', async () => {
			const testCases: Array<
				TestCase<{ owner: string; post: Partial<PostCreate> }, ErrorApiResponse>
			> = [
				{
					input: {
						owner: fakeUser.id,
						post: {
							images: ['https://example.com/image.jpg'],
						},
					},
					expected: {
						statusCode: 400,
						error: 'Bad Request',
						message: 'Description is invalid or missing',
					},
				},
				{
					input: {
						owner: fakeUser.id,
						post: {
							description: 'This is a test post',
						},
					},
					expected: {
						statusCode: 400,
						error: 'Bad Request',
						message: 'Images are invalid or missing',
					},
				},
			];

			testCases.forEach(async ({ input, expected }) => {
				await addPost(input.owner, input.post)
					.expect(400)
					.then(res => {
						const body = res.body as ErrorApiResponse;

						expect(body.statusCode).toStrictEqual(expected.statusCode);
						expect(body.error).toStrictEqual(expected.error);
						expect(body.message).toStrictEqual(expected.message);
					});
			});
		});

		it('Should return 404 when the owner id is not found', async () => {
			const invalidUserId = crypto.randomUUID();
			const newPost: PostCreate = {
				images: ['https://example.com/image.jpg'],
				description: 'This is a test post',
			};

			await addPost(invalidUserId, newPost)
				.expect(404)
				.then(res => {
					const body = res.body as ApiResponse<{ post: Post }>;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.message).toStrictEqual('Post owner is not found!');
				});
		});
	});

	describe('GET /users/:userId/posts', () => {
		const getUserPosts = (
			userId: string,
			page: number | string,
			limit: number | string,
		) => {
			const query = new URLSearchParams();

			if (page) {
				query.set('page', page.toString());
			}

			if (limit) {
				query.set('limit', limit.toString());
			}

			return request(server.listener)
				.get(`/users/${userId}/posts?${query.toString()}`)
				.set('Authorization', `Bearer ${accessToken}`);
		};

		it('Should return 404 when the user is not found', async () => {
			const invalidUserId = crypto.randomUUID();

			await getUserPosts(invalidUserId, 1, 10)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('User not found!');
				});
		});

		it('Should return 400 when page or limit query is not a number', async () => {
			const validUserId = fakeUser.id;

			// Invalid page
			await getUserPosts(validUserId, 'a', 10)
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.message).toStrictEqual('"page" must be a number');
				});

			// Invalid limit
			await getUserPosts(validUserId, 1, 'b')
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.message).toStrictEqual('"limit" must be a number');
				});
		});

		it('Should return 400 when userId is not valid', async () => {
			const invalidUserId = 'invalid-user-id';

			await getUserPosts(invalidUserId, 1, 10)
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('"userId" must be a valid GUID');
				});
		});

		it("Should return user's posts when found", async () => {
			const validUserId = fakeUser.id;

			await getUserPosts(validUserId, 1, 10)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						posts: Post[];
						metadata: MetaData;
					}>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('User posts fetched successfully');
				});
		});

		it("Should return the second page of a user's posts and limit to 5 posts per page", async () => {
			const validUserId = fakeUser.id;

			await getUserPosts(validUserId, 2, 5)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						posts: Post[];
						metadata: MetaData;
					}>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('User posts fetched successfully');
					expect(body.data.metadata.limit).toStrictEqual(5);
					expect(body.data.metadata.currentPage).toStrictEqual(2);
				});
		});
	});

	describe('GET /posts/:id', () => {
		const getPostById = (id: string) =>
			request(server.listener)
				.get(`/posts/${id}`)
				.set('Authorization', `Bearer ${accessToken}`);

		it('Should return post when found', async () => {
			const validPostId = await request(server.listener)
				.get('/posts')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
				.then(
					res => (res.body as ApiResponse<{ posts: Post[] }>).data.posts[0].id,
				);

			await getPostById(validPostId)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ post: Post }>;
					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Post fetched successfully');
					expect(body.data.post.id).toStrictEqual(validPostId);
				});
		});

		it('Should return 404 when post is not found', async () => {
			const invalidId = crypto.randomUUID();

			await getPostById(invalidId)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('This post is not found!');
				});
		});
	});

	describe('PUT /posts/:id', () => {
		const updatePost = (postId: string, post: Partial<PostEdit>) =>
			request(server.listener)
				.put(`/posts/${postId}`)
				.send(post)
				.set('Authorization', `Bearer ${accessToken}`);

		const getValidPost = async () =>
			request(server.listener)
				.get('/posts')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
				.then(
					res => (res.body as ApiResponse<{ posts: Post[] }>).data.posts[0],
				);

		it('Should return 200 when post is updated successfully', async () => {
			const validPost = await getValidPost();

			await updatePost(validPost.id, {
				description: 'edited a test post',
				dislikes: [],
				images: [],
				likes: [],
			} as PostEdit)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ post: Post }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Post updated successfully');
				});
		});

		it('Should return 404 when post is not found', async () => {
			const invalidId = crypto.randomUUID();

			await updatePost(invalidId, {
				description: 'edited a test post',
				dislikes: [],
				images: [],
				likes: [],
			} as PostEdit)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('This post is not found!');
				});
		});

		it('Should return 400 when there are missing fields', async () => {
			const validPost = await getValidPost();

			const testCases: Array<TestCase<Partial<Post>, ErrorApiResponse>> = [
				{
					input: {
						dislikes: [],
						images: [],
						likes: [],
					},
					expected: {
						statusCode: 400,
						error: 'Bad Request',
						message: 'Description is invalid or missing',
					},
				},
				{
					input: {
						description: 'edited a test post',
						images: [],
						likes: [],
					},
					expected: {
						statusCode: 400,
						error: 'Bad Request',
						message: 'Dislikes are invalid or missing',
					},
				},
				{
					input: {
						description: 'edited a test post',
						dislikes: [],
						likes: [],
					},
					expected: {
						statusCode: 400,
						error: 'Bad Request',
						message: 'Images are invalid or missing',
					},
				},
				{
					input: {
						description: 'edited a test post',
						dislikes: [],
						images: [],
					},
					expected: {
						statusCode: 400,
						error: 'Bad Request',
						message: 'Likes are invalid or missing',
					},
				},
			];

			testCases.forEach(async ({ input, expected }) => {
				await updatePost(validPost.id, input)
					.expect(400)
					.then(res => {
						const body = res.body as ErrorApiResponse;

						expect(body.statusCode).toStrictEqual(expected.statusCode);
						expect(body.error).toStrictEqual(expected.error);
						expect(body.message).toStrictEqual(expected.message);
					});
			});
		});

		it('Should return 404 when adding likes or dislikes with invalid user id', async () => {
			const validPost = await getValidPost();

			// Invalid likes
			await updatePost(validPost.id, {
				description: 'edited a test post',
				dislikes: [],
				images: [],
				likes: [crypto.randomUUID()],
			} as PostEdit)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('Some likes are not valid!');
				});

			// Invalid dislikes
			await updatePost(validPost.id, {
				description: 'edited a test post',
				likes: [],
				images: [],
				dislikes: [crypto.randomUUID()],
			} as PostEdit)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('Some dislikes are not valid!');
				});
		});
	});

	describe('DELETE /posts/:id', () => {
		const deletePostById = (id: string) =>
			request(server.listener)
				.delete(`/posts/${id}`)
				.set('Authorization', `Bearer ${accessToken}`);

		it('Should delete post when found', async () => {
			const validPostId = await request(server.listener)
				.get('/posts')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
				.then(
					res => (res.body as ApiResponse<{ posts: Post[] }>).data.posts[0].id,
				);

			await deletePostById(validPostId)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ postId: string }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Post deleted successfully');
					expect(body.data.postId).toStrictEqual(validPostId);
				});
		});

		it('Should return 404 when post is not found', async () => {
			const invalidId = crypto.randomUUID();

			await deletePostById(invalidId)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('This post is not found!');
				});
		});
	});
});
