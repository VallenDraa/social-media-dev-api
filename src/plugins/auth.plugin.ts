import { type AccessToken } from 'src/models/auth.model';
import { type Server } from '@hapi/hapi';
import hapiAuthJwt2 from 'hapi-auth-jwt2';
import { DEFAULT_AUTH_STRATEGY } from 'src/constants';
import { type Store } from 'src/store';

export const authPlugin = async (server: Server, store: Store) => {
	await server.register(hapiAuthJwt2);

	server.auth.strategy(DEFAULT_AUTH_STRATEGY, 'jwt', {
		key: process.env.JWT_SECRET,
		verifyOptions: {
			ignoreExpiration: false,
		},
		validate(decoded: AccessToken) {
			const { users } = store.getState();
			const user = users.find(user => user.id === decoded.sub);

			return { isValid: Boolean(user) };
		},
	} satisfies hapiAuthJwt2.Options);

	server.auth.default(DEFAULT_AUTH_STRATEGY);
};
