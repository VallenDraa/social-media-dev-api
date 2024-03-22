import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { commentRoutes, postRoutes, userRoutes } from './routes';
import { seedStoreInit } from './utils/seed-store';
import { authPlugin } from './plugins/auth.plugin';
import { dataStore } from './store';
import { authRoutes } from './routes/auth.routes';
import { loggerPlugin } from './plugins/logger.plugin';

export const createServer = async (isTest: boolean) => {
	dotenv.config();

	// Setup the store and reset it every 5 minutes
	seedStoreInit();

	if (!isTest) {
		const fiveMinutes = 300_000;
		setInterval(seedStoreInit, fiveMinutes);
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

	if (!isTest) {
		server.logger.info(`Server running on ${server.info.uri}`);
	}

	return server;
};
