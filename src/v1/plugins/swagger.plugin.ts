import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';
import { type Server } from '@hapi/hapi';
import { version } from '../../../package.json';
import { SWAGGER_SECURITY_DEFINITION } from './auth.plugin';

export const swaggerPlugin = async (server: Server) => {
	const options: HapiSwagger.RegisterOptions = {
		basePath: '/api/v1/',
		documentationPath: '/',
		info: {
			title: 'Social Media Mock Development API Documentation',
			contact: {
				email: 'vallenatwork@gmail.com',
				name: 'VallenDra',
				url: 'https://www.vallendra.my.id',
			},
			description:
				'This is a mock social media API that is used for learning new things on frontend that requires a REST API.',
			termsOfService: 'https://opensource.org/licenses/MIT',
			version,
		},
		routeTag: tags => !tags.includes('private') && tags.includes('api'),
		grouping: 'tags',
		sortEndpoints: 'ordered',
		securityDefinitions: {
			[SWAGGER_SECURITY_DEFINITION]: {
				description: 'Standard Authorization header using the Bearer scheme',
				in: 'header',
				name: 'Authorization',
				type: 'apiKey',
			},
		},
		OAS: 'v3.0',
		uiOptions: { defaultModelsExpandDepth: -1, layout: 'BaseLayout' },
		schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
	};

	await server.register([Inert, Vision, { plugin: HapiSwagger, options }], {
		routes: { prefix: '/api/v1' },
	});
};
