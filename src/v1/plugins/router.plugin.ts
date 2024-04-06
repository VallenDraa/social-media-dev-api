import { type Server } from '@hapi/hapi';
import {
	authRoutes,
	friendRoutes,
	commentRoutes,
	postRoutes,
	userRoutes,
} from 'src/v1/routes';

export const routerPlugin = async (server: Server) => {
	await server.register(
		{
			name: 'version-one-router',
			version: '1.0.0',
			register(server) {
				server.route([
					...userRoutes,
					...friendRoutes,
					...postRoutes,
					...commentRoutes,
					...authRoutes,
				]);
			},
		},
		{ routes: { prefix: '/api/v1' } },
	);
};
