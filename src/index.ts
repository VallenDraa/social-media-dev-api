import { createServer } from './server';

createServer(false)
	.then(async server => server.start())
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
