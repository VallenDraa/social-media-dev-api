import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';
import { type Server } from '@hapi/hapi';
import { version } from '../../package.json';

export const swaggerPlugin = async (server: Server) => {
	const options: HapiSwagger.RegisterOptions = {
		basePath: '/',
		documentationPath: '/',
		info: {
			title: "Vallendra's Mock Development API Documentation",
			contact: {
				email: 'vallenatwork@gmail.com',
				name: 'VallenDra',
				url: 'https://www.vallendra.my.id',
			},
			description:
				"This is a mock social media API for when I'm learning new things on frontend that requires a REST API.",
			termsOfService: 'https://opensource.org/licenses/MIT',
			version,
		},
		routeTag: tags => !tags.includes('private') && tags.includes('api'),
		grouping: 'tags',
		sortEndpoints: 'ordered',
		uiOptions: { defaultModelsExpandDepth: -1 },
		schemes: ['http', 'https'],
	};

	await server.register([Inert, Vision, { plugin: HapiSwagger, options }]);
};
