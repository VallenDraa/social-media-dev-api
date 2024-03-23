import { createServer } from './server';
import { dataStore } from './store';

createServer(false)
	.then(async server => {
		await server.start();

		const { email, password } = dataStore.getState().users[0];
		server.logger.info(JSON.stringify({ email, password }));
	})
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
