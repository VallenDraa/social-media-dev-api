import { type Server } from '@hapi/hapi';
import {
	type Post,
	type ApiResponse,
	type Login,
	type UserWithoutPassword,
	type Comment,
	type MetaData,
	type ErrorApiResponse,
	type PostDetail,
	type CommentCreate,
	type CommentEdit,
} from 'src/models';
import { createServer } from 'src/server';
import request from 'supertest';
import { registerDataMock } from 'src/__tests__/mocks';

describe('Comments e2e', () => {
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

	const getPost = async () =>
		request(server.listener)
			.get('/posts?has-comments=true&with-top-comments=true')
			.set('Authorization', `Bearer ${accessToken}`)
			.then(
				res => (res.body as ApiResponse<{ posts: PostDetail[] }>).data.posts[0],
			);

	describe('GET /posts/:postId/comments', () => {
		const getComments = (
			postId: string,
			page?: number | string,
			limit?: number | string,
		) => {
			const query = new URLSearchParams();

			if (page) {
				query.append('page', page.toString());
			}

			if (limit) {
				query.append('limit', limit.toString());
			}

			return request(server.listener)
				.get(`/posts/${postId}/comments?${query.toString()}`)
				.set('Authorization', `Bearer ${accessToken}`);
		};

		it('Should return 200 and the first page of comments from a post', async () => {
			const post = await getPost();

			await getComments(post.id)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						posts: Post[];
						metadata: MetaData;
					}>;

					expect(body.data.metadata.currentPage).toStrictEqual(1);
					expect(body.data.metadata.limit).toStrictEqual(10);
				});
		});

		it('Should return 404 if postId is invalid', async () => {
			const invalidPostId = crypto.randomUUID();

			await getComments(invalidPostId)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('This post is not found!');
				});
		});

		it('Should empty array when the page is more than the last available page', async () => {
			const post = await getPost();

			await getComments(post.id, 1000)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{
						comments: Comment[];
						metadata: MetaData;
					}>;

					expect(body.data.comments).toStrictEqual([]);
					expect(body.data.metadata.currentPage).toStrictEqual(1000);
					expect(body.data.metadata.lastPage).toBeLessThan(1000);
					expect(body.data.metadata.limit).toStrictEqual(10);
				});
		});

		it('Should return 400 if page or limit page is invalid', async () => {
			const post = await getPost();

			// Invalid page
			await getComments(post.id, 'sdsdsd')
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('"page" must be a number');
				});

			// Invalid limit
			await getComments(post.id, 1, 'sdsds')
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('"limit" must be a number');
				});
		});
	});

	describe('GET /comments/:id', () => {
		const getComment = (commentId: string) =>
			request(server.listener)
				.get(`/comments/${commentId}`)
				.set('Authorization', `Bearer ${accessToken}`);

		it("Should return 200 and the comment's detail", async () => {
			const post = await getPost();
			const comment = post.comments[0];

			await getComment(comment)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ comment: Comment }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Comment fetched successfully');
					expect(body.data.comment.id).toStrictEqual(comment);
				});
		});

		it('Should return 404 if the comment is not found', async () => {
			const invalidCommentId = crypto.randomUUID();

			await getComment(invalidCommentId)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('This comment is not found!');
				});
		});

		it('Should return 400 when the id is invalid', async () => {
			await getComment('sdsdsd')
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('"id" must be a valid GUID');
				});
		});
	});

	describe('POST /comments', () => {
		const addComment = (postId: string, payload: Partial<CommentCreate>) =>
			request(server.listener)
				.post(`/posts/${postId}/comments`)
				.set('Authorization', `Bearer ${accessToken}`)
				.send(payload);

		it("Should return 201 and the comment's detail", async () => {
			const post = await getPost();

			const payload: CommentCreate = {
				content: 'This is a comment',
				owner: fakeUser.id,
				replies: [],
				likes: [],
				dislikes: [],
			};

			await addComment(post.id, payload)
				.expect(201)
				.then(res => {
					const body = res.body as ApiResponse<{ comment: Comment }>;

					expect(body.statusCode).toStrictEqual(201);
					expect(body.message).toStrictEqual('Comment created successfully');
					expect(body.data.comment.content).toStrictEqual(payload.content);
				});
		});

		it('Should return 400 if some fields are invalid', async () => {
			const post = await getPost();

			// Empty content field
			await addComment(post.id, {
				content: '',
				dislikes: [],
				likes: [],
				owner: fakeUser.id,
				replies: [],
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual(
						'"content" is not allowed to be empty',
					);
				});

			// Missing content field
			await addComment(post.id, {
				dislikes: [],
				likes: [],
				owner: fakeUser.id,
				replies: [],
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('Content is invalid or missing');
				});

			// Missing dislikes field
			await addComment(post.id, {
				content: 'new comment',
				likes: [],
				owner: fakeUser.id,
				replies: [],
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('dislikes are invalid or missing');
				});

			// Missing likes field
			await addComment(post.id, {
				content: 'new comment',
				dislikes: [],
				owner: fakeUser.id,
				replies: [],
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('likes are invalid or missing');
				});

			// Missing replies field
			await addComment(post.id, {
				content: 'new comment',
				likes: [],
				dislikes: [],
				owner: fakeUser.id,
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('replies are invalid or missing');
				});
		});

		it('Should return 404 when post is not found', async () => {
			const invalidPostId = crypto.randomUUID();

			await addComment(invalidPostId, {
				content: 'This is a comment',
				owner: fakeUser.id,
				replies: [],
				likes: [],
				dislikes: [],
			})
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual(
						'The post for this comment is missing!',
					);
				});
		});
	});

	describe('PUT /comments/:id', () => {
		const editComment = (commentId: string, payload: Partial<CommentEdit>) =>
			request(server.listener)
				.put(`/comments/${commentId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.send(payload);

		it("Should return 200 and the comment's detail when edit is successful", async () => {
			const post = await getPost();
			const comment = post.comments[0];

			await editComment(comment, {
				content: 'This is a new content',
				dislikes: [],
				likes: [],
				replies: [],
			})
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ comment: Comment }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Comment updated successfully');
				});
		});

		it('Should return 400 if some fields are invalid', async () => {
			const post = await getPost();
			const comment = post.comments[0];

			// Empty content field
			await editComment(comment, {
				content: '',
				dislikes: [],
				likes: [],
				replies: [],
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual(
						'"content" is not allowed to be empty',
					);
				});

			// Missing content field
			await editComment(comment, {
				dislikes: [],
				likes: [],
				replies: [],
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('Content is invalid or missing');
				});

			// Missing dislikes field
			await editComment(comment, {
				content: 'new edit content',
				likes: [],
				replies: [],
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('dislikes are invalid or missing');
				});

			// Missing likes field
			await editComment(comment, {
				content: 'new edit content',
				dislikes: [],
				replies: [],
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('likes are invalid or missing');
				});

			// Missing replies field
			await editComment(comment, {
				content: 'new edit content',
				likes: [],
				dislikes: [],
			})
				.expect(400)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(400);
					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('replies are invalid or missing');
				});
		});

		it('Should return 404 when the comment is not found', async () => {
			const invalidCommentId = crypto.randomUUID();

			await editComment(invalidCommentId, {
				content: 'This is a new content',
				dislikes: [],
				likes: [],
				replies: [],
			})
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('This comment is not found!');
				});
		});

		it('Should return 404 when adding likes or dislikes with invalid user id', async () => {
			const post = await getPost();
			const comment = post.comments[0];

			// Invalid likes
			await editComment(comment, {
				content: 'This is a new content',
				dislikes: [],
				likes: [crypto.randomUUID()],
				replies: [],
			})
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('Some likes are not valid!');
				});

			await editComment(comment, {
				content: 'This is a new content',
				dislikes: [crypto.randomUUID()],
				likes: [],
				replies: [],
			})
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('Some dislikes are not valid!');
				});
		});
	});

	describe('DELETE /comments/:id', () => {
		const deleteComment = (commentId: string) =>
			request(server.listener)
				.delete(`/comments/${commentId}`)
				.set('Authorization', `Bearer ${accessToken}`);

		it('Should return 200 and delete comment when comment exists', async () => {
			const post = await getPost();
			const comment = post.comments[0];

			await deleteComment(comment)
				.expect(200)
				.then(res => {
					const body = res.body as ApiResponse<{ commentId: string }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual('Comment deleted successfully');
					expect(body.data.commentId).toStrictEqual(comment);
				});
		});

		it("Should return 400 when comment doesn't exist", async () => {
			const invalidCommentId = crypto.randomUUID();

			await deleteComment(invalidCommentId)
				.expect(404)
				.then(res => {
					const body = res.body as ErrorApiResponse;

					expect(body.statusCode).toStrictEqual(404);
					expect(body.error).toStrictEqual('Not Found');
					expect(body.message).toStrictEqual('This comment is not found!');
				});
		});
	});
});
