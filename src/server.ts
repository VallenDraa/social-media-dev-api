import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { commentRoutes, postRoutes, userRoutes } from './routes';
import { seedStoreInit } from './utils/seed-store';
import { authPlugin } from './plugins/auth.plugin';
import { store } from './store';
import { authRoutes } from './routes/auth.routes';
import { loggerPlugin } from './plugins/logger.plugin';

const boostrap = async () => {
	dotenv.config();

	// Setup the store and reset it every 5 minutes
	seedStoreInit();
	const fiveMinutes = 300_000;
	setInterval(seedStoreInit, fiveMinutes);

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

	await loggerPlugin(server);
	await authPlugin(server, store);
	await server.start();

	server.logger.info(`Server running on ${server.info.uri}`);
};

boostrap().catch(err => {
	console.error(err);
	process.exit(1);
});
