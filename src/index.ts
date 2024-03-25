import { createServer } from './server';
import { dataStore } from './store';

createServer(false)
	.then(async server => {
		await server.start();

		server.logger.info(`Server running on ${server.info.uri}`);

		if (process.env.NODE_ENV === 'development') {
			// For manually testing protected routes
			const { email, password } = dataStore.getState().users[0];
			server.logger.info(JSON.stringify({ email, password }));
		}
	})
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
