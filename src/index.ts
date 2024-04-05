import { createServer } from './server';

createServer(false)
	.then(async server => {
		await server.start();

		server.logger.info(`Server running on ${server.info.uri}`);
	})
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
