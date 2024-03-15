import Boom from '@hapi/boom';
import { type Lifecycle } from '@hapi/hapi';

export const failAction: Lifecycle.FailAction = (req, h, err) => {
	throw Boom.badRequest(err?.message);
};
