import { dataStore, seedStoreInit } from 'src/store';

describe('seedStore', () => {
	let OLD_ENV: NodeJS.ProcessEnv;

	beforeAll(() => {
		const OLD_ENV = process.env;

		process.env = {
			...OLD_ENV,
			FAKE_COMMENT_AMOUNT: '10',
			FAKE_POST_AMOUNT: '10',
			FAKE_USER_AMOUNT: '10',
		};

		dataStore.resetStore();

		seedStoreInit();
	});

	afterAll(() => {
		process.env = OLD_ENV;
	});

	it('Should have the right amount of data generated from the given amount in the env', () => {
		const { comments, posts, users } = dataStore.getState();

		expect(users.length).toBe(10);
		expect(posts.length).toBe(10);

		// Comments will not have the same amount
		// as the fake comment amount given in the env.
		// It's because each commentw will probably have replies,
		// which will result in more comments generated from the given amount
		// That is why we check if the comments amount is >= 10
		expect(comments.length).toBeGreaterThanOrEqual(10);
	});

	describe('Users', () => {
		it("All users 'username' and 'email' should be unique", () => {
			const { users } = dataStore.getState();

			const usernames = new Set(users.map(user => user.username));
			const emails = new Set(users.map(user => user.email));

			expect(usernames.size).toBe(users.length);
			expect(emails.size).toBe(users.length);
		});

		it("All users 'createdAt' field should be before 'updatedAt' field", () => {
			const { users } = dataStore.getState();

			for (const { createdAt, updatedAt } of users) {
				expect(new Date(createdAt).getTime()).toBeLessThanOrEqual(
					new Date(updatedAt).getTime(),
				);
			}
		});
	});

	describe('Comments', () => {
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

		it("All comments 'createdAt' field should be before 'updatedAt' field", () => {
			const { comments } = dataStore.getState();

			for (const { createdAt, updatedAt } of comments) {
				expect(new Date(createdAt).getTime()).toBeLessThanOrEqual(
					new Date(updatedAt).getTime(),
				);
			}
		});
	});

	describe('FriendsList', () => {
		it("All friendslist 'list' field entries should be unique", () => {
			const { friendsList } = dataStore.getState();

			for (const { list } of friendsList) {
				const uniqueFriends = new Set(list.map(friend => friend.id));

				expect(uniqueFriends.size).toBe(list.length);
			}
		});

		it('Each user should have a friendslist', () => {
			const { friendsList, users } = dataStore.getState();

			for (const user of users) {
				const userFriendsList = friendsList.find(
					entry => entry.userId === user.id,
				);

				expect(userFriendsList).toBeDefined();
			}
		});

		it("All friendslist 'createdAt' field should be before 'updatedAt' field", () => {
			const { friendsList } = dataStore.getState();

			for (const { createdAt, updatedAt } of friendsList) {
				expect(new Date(createdAt).getTime()).toBeLessThanOrEqual(
					new Date(updatedAt).getTime(),
				);
			}
		});
	});
});
