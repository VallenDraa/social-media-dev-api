import { store } from 'src/store';
import { seedStoreInit } from 'src/utils/seed-store';

describe('seedStore', () => {
	const OLD_ENV = process.env;

	beforeAll(() => {
		jest.resetModules();
		process.env = {
			...OLD_ENV,
			FAKE_COMMENT_AMOUNT: '10',
			FAKE_POST_AMOUNT: '10',
			FAKE_USER_AMOUNT: '10',
		};

		store.resetStore();
		seedStoreInit();
	});

	afterAll(() => {
		process.env = OLD_ENV;
	});

	it('Should have 10 users and posts', () => {
		const { posts, users } = store.getState();

		expect(users.length).toBe(10);
		expect(posts.length).toBe(10);
	});

	it("All users 'username' and 'email' should be unique", () => {
		const { users } = store.getState();

		const usernames = new Set(users.map(user => user.username));
		const emails = new Set(users.map(user => user.email));

		expect(usernames.size).toBe(users.length);
		expect(emails.size).toBe(users.length);
	});

	it('All comments replies should belong to the same posts', () => {
		const { comments } = store.getState();

		for (const comment of comments) {
			const { replies, post } = comment;

			for (const reply of replies) {
				const replyComment = comments.find(c => c.id === reply);

				expect(replyComment?.post).toBe(post);
			}
		}
	});

	it('All comments replies are unique', () => {
		const { comments } = store.getState();

		for (const comment of comments) {
			const { replies } = comment;

			const uniqueReplies = new Set(replies);

			expect(uniqueReplies.size).toBe(replies.length);
		}
	});
});
