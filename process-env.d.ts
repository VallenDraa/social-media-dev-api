declare namespace NodeJS {
	export interface ProcessEnv {
		PORT: string;
		HOST: string;
		FAKE_USER_AMOUNT: string;
		FAKE_POST_AMOUNT: string;
		FAKE_COMMENT_AMOUNT: string;
		ACCESS_TOKEN_SECRET: string;
		REFRESH_TOKEN_SECRET: string;
		NODE_ENV: string;
	}
}
