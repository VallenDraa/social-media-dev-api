import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { postRoutes } from './routes';
import { seedStore } from './seed';
import { store } from './store';

const boostrap = async () => {
	dotenv.config();

	// Setup the store and reset it every 10 minutes
	const tenMinutes = 600_000;
	seedStore(store);
	setInterval(() => {
		seedStore(store);
	}, tenMinutes);

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
	});

	server.route([...postRoutes]);

	await server.start();
	console.log(`Server running on ${server.info.uri}`);
};

boostrap().catch(err => {
	console.error(err);
	process.exit(1);
});
