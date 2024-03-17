import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { commentRoutes, postRoutes, userRoutes } from './routes';
import { seedStoreInit } from './utils/seed-store';

const boostrap = async () => {
	dotenv.config();

	// Setup the store and reset it every 5 minutes
	seedStoreInit();
	const fiveMinutes = 300_000;
	setInterval(seedStoreInit, fiveMinutes);

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
	});

	server.route([...userRoutes, ...postRoutes, ...commentRoutes]);

	await server.start();
	console.log(`Server running on ${server.info.uri}`);
};

boostrap().catch(err => {
	console.error(err);
	process.exit(1);
});
