import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';
import { type Server } from '@hapi/hapi';
import { version } from '../../package.json';
import { SWAGGER_SECURITY_DEFINITION } from 'src/constants';

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
		jsonPath: './swagger.json',
		jsonRoutePath: '/swagger.json',
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
		uiOptions: { defaultModelsExpandDepth: -1 },
		schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
	};

	await server.register([Inert, Vision, { plugin: HapiSwagger, options }]);
};
