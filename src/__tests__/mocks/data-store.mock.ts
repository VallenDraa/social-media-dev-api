import { seedStoreInit, dataStore } from 'src/store';

export const createDataStoreMock = ({
	fakeCommentAmount,
	fakePostAmount,
	fakeUserAmount,
}: {
	fakeCommentAmount: string;
	fakePostAmount: string;
	fakeUserAmount: string;
}) => {
	const OLD_ENV = process.env;

	process.env = {
		...OLD_ENV,
		FAKE_COMMENT_AMOUNT: fakeCommentAmount,
		FAKE_POST_AMOUNT: fakePostAmount,
		FAKE_USER_AMOUNT: fakeUserAmount,
	};

	dataStore.resetStore();
	seedStoreInit();

	return OLD_ENV;
};

export const dataStoreMockTeardown = (OLD_ENV: NodeJS.ProcessEnv) => {
	process.env = OLD_ENV;
};
