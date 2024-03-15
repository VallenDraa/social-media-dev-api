import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';

const boostrap = async () => {
	dotenv.config();

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
	});

	await server.start();
	console.log(`Server running on ${server.info.uri}`);
};

boostrap().catch(err => {
	console.error(err);
	process.exit(1);
});
