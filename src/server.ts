import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { v1Init } from 'src/v1';

export const createServer = async (isTest: boolean) => {
	dotenv.config();

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
		routes: {
			cors: { origin: ['*'], credentials: true },
		},
	});

	await v1Init(server, isTest);

	server.route({
		path: '/',
		method: 'GET',
		options: { auth: false },
		handler: (_req, h) => h.redirect('/api/v1'),
	});

	return server;
};
