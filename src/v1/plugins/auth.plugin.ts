import { type Server } from '@hapi/hapi';
import hapiAuthJwt2 from 'hapi-auth-jwt2';
import { validateAccessToken } from 'src/v1/utils/jwt';
import { type DataStore } from 'src/v1/store';

export const DEFAULT_AUTH_STRATEGY = 'jwt-strategy';
export const SWAGGER_SECURITY_DEFINITION = 'BEARER';

export const authPlugin = async (server: Server, store: DataStore) => {
	await server.register(hapiAuthJwt2, { routes: { prefix: '/api/v1' } });

	server.auth.strategy(DEFAULT_AUTH_STRATEGY, 'jwt', {
		key: process.env.ACCESS_TOKEN_SECRET,
		verifyOptions: {
			ignoreExpiration: false,
		},
		validate: validateAccessToken(store),
	} satisfies hapiAuthJwt2.Options);

	server.auth.default(DEFAULT_AUTH_STRATEGY);
};
