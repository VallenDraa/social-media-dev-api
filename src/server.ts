import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { authRoutes, commentRoutes, postRoutes, userRoutes } from 'src/routes';
import { loggerPlugin, authPlugin } from 'src/plugins';
import { seedStoreInit, dataStore, refreshStore } from 'src/store';

export const createServer = async (isTest: boolean) => {
	dotenv.config();

	// Setup the store and reset it every 5 minutes
	seedStoreInit();

	if (!isTest) {
		const fiveMinutes = 300_000;
		refreshStore(fiveMinutes);
	}

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
		routes: {
			cors: {
				origin: ['*'],
			},
		},
	});

	server.route([...userRoutes, ...postRoutes, ...commentRoutes, ...authRoutes]);

	if (!isTest) {
		await loggerPlugin(server);
	}

	await authPlugin(server, dataStore);

	return server;
};
