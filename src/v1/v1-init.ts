import { type Server } from '@hapi/hapi';
import {
	swaggerPlugin,
	authPlugin,
	loggerPlugin,
	routerPlugin,
} from 'src/v1/plugins';
import { dataStore, refreshStore, seedStoreInit } from 'src/v1/store';

export const v1Init = async (server: Server, isTest: boolean) => {
	seedStoreInit();

	if (!isTest) {
		const thirtyMinutes = 1_800_000;
		refreshStore(thirtyMinutes);

		await swaggerPlugin(server);
		await loggerPlugin(server);
	}

	await authPlugin(server, dataStore);
	await routerPlugin(server);
};
