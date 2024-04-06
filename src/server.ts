import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { swaggerPlugin, loggerPlugin, authPlugin } from 'src/plugins';
import { seedStoreInit, dataStore, refreshStore } from 'src/store';
import {
	authRoutes,
	friendRoutes,
	commentRoutes,
	postRoutes,
	userRoutes,
} from './routes';

export const createServer = async (isTest: boolean) => {
	dotenv.config();

	// Setup the store and reset it every 5 minutes
	seedStoreInit();

	if (!isTest) {
		const thirtyMinutes = 1_800_000;
		refreshStore(thirtyMinutes);
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

	if (!isTest) {
		await swaggerPlugin(server);
		await loggerPlugin(server);
	}

	await authPlugin(server, dataStore);

	server.route([
		...userRoutes,
		...friendRoutes,
		...postRoutes,
		...commentRoutes,
		...authRoutes,
	]);

	return server;
};
