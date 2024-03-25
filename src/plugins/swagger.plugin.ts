import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';
import { type Server } from '@hapi/hapi';
import { version } from '../../package.json';

export const swaggerPlugin = async (server: Server) => {
	const options: HapiSwagger.RegisterOptions = {
		basePath: '/',
		documentationPath: '/docs',
		info: {
			title: "Vallendra's Mock Development API Documentation",
			contact: {
				email: 'vallenatwork@gmail.com',
				license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
				name: 'VallenDra',
				url: 'https://www.vallendra.my.id',
			},
			description:
				"This is a mock social media API for when I'm learning new things on frontend that requires a REST API.",
			termsOfService: 'https://opensource.org/licenses/MIT',
			version,
		},
		schemes: ['http', 'https'],
	};

	await server.register([Inert, Vision, { plugin: HapiSwagger, options }]);
};
