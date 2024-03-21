import { type Server } from '@hapi/hapi';
import hapiAuthJwt2 from 'hapi-auth-jwt2';
import { DEFAULT_AUTH_STRATEGY } from 'src/constants';
import { validateAccessToken } from 'src/utils/jwt';
import { type DataStore } from 'src/store';

export const authPlugin = async (server: Server, store: DataStore) => {
	await server.register(hapiAuthJwt2);

	server.auth.strategy(DEFAULT_AUTH_STRATEGY, 'jwt', {
		key: process.env.ACCESS_TOKEN_SECRET,
		verifyOptions: {
			ignoreExpiration: false,
		},
		validate: validateAccessToken(store),
	} satisfies hapiAuthJwt2.Options);

	server.auth.default(DEFAULT_AUTH_STRATEGY);
};
