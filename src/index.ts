import { createServer } from './server';

createServer(false).catch(err => {
	console.error(err);
	process.exit(1);
});
