import { type Server } from '@hapi/hapi';
import HapiPino from 'hapi-pino';

export const loggerPlugin = async (server: Server) => {
	await server.register(
		{
			plugin: HapiPino,
			options: {
				redact: ['req.headers.authorization'],
			},
		},
		{ routes: { prefix: '/api/v1' } },
	);
};
