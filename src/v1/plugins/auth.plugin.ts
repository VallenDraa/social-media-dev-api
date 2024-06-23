import { type Server } from '@hapi/hapi';
import hapiAuthJwt2 from 'hapi-auth-jwt2';
import {
	ACCESS_TOKEN_COOKIE_NAME,
	validateAccessToken,
} from 'src/v1/utils/jwt';
import { type DataStore } from 'src/v1/store';

export const JWT_AUTH_STRATEGY = 'jwt-strategy';
export const DEFAULT_AUTH_STRATEGY = JWT_AUTH_STRATEGY;
export const SWAGGER_SECURITY_DEFINITION = 'BEARER';

export const authPlugin = async (server: Server, store: DataStore) => {
	await server.register(hapiAuthJwt2, { routes: { prefix: '/api/v1' } });

	server.auth.strategy(JWT_AUTH_STRATEGY, 'jwt', {
		cookieKey: ACCESS_TOKEN_COOKIE_NAME,
		key: process.env.ACCESS_TOKEN_SECRET,
		verifyOptions: {
			ignoreExpiration: false,
		},
		validate: validateAccessToken(store),
	} satisfies hapiAuthJwt2.Options);
};
