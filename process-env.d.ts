/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare namespace NodeJS {
	export interface ProcessEnv {
		PORT: string;
		HOST: string;
		FAKE_USER_AMOUNT: string;
		FAKE_POST_AMOUNT: string;
		FAKE_COMMENT_AMOUNT: string;
	}
}
