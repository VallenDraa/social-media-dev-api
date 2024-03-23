import {
	createDataStoreMock,
	dataStoreMockTeardown,
} from 'src/__tests__/mocks';
import { dataStore } from 'src/store';

describe('seedStore', () => {
	let OLD_ENV: NodeJS.ProcessEnv;

	beforeAll(() => {
		OLD_ENV = createDataStoreMock({
			fakeCommentAmount: '10',
			fakePostAmount: '10',
			fakeUserAmount: '10',
		});
	});

	afterAll(() => {
		dataStoreMockTeardown(OLD_ENV);
	});

	it('Should have 10 users and posts', () => {
		const { posts, users } = dataStore.getState();

		expect(users.length).toBe(10);
		expect(posts.length).toBe(10);
	});

	it("All users 'username' and 'email' should be unique", () => {
		const { users } = dataStore.getState();

		const usernames = new Set(users.map(user => user.username));
		const emails = new Set(users.map(user => user.email));

		expect(usernames.size).toBe(users.length);
		expect(emails.size).toBe(users.length);
	});

	it('All comments replies should belong to the same posts', () => {
		const { comments } = dataStore.getState();

		for (const comment of comments) {
			const { replies, post } = comment;

			for (const reply of replies) {
				const replyComment = comments.find(c => c.id === reply);

				expect(replyComment?.post).toBe(post);
			}
		}
	});

	it('All comments replies are unique', () => {
		const { comments } = dataStore.getState();

		for (const comment of comments) {
			const { replies } = comment;

			const uniqueReplies = new Set(replies);

			expect(uniqueReplies.size).toBe(replies.length);
		}
	});
});
