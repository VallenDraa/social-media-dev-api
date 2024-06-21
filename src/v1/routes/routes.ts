import { type ServerRoute } from '@hapi/hapi';
import { userRoutes } from './user';
import { friendRoutes } from './friend';
import { postRoutes } from './post';
import { commentRoutes } from './comment';
import { authRoutes } from './auth';

export const V1_PREFIX = '/api/v1';
export const allRoutes = [
	...userRoutes,
	...friendRoutes,
	...postRoutes,
	...commentRoutes,
	...authRoutes,
].map((route: ServerRoute) => {
	route.path = V1_PREFIX + route.path;

	return route;
});
