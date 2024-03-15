/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare global {
	namespace NodeJS {
		export interface ProcessEnv {
			PORT: string;
			HOST: string;
		}
	}
}
