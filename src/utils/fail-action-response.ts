import Boom from '@hapi/boom';
import { type Lifecycle } from '@hapi/hapi';

export const failAction: Lifecycle.FailAction = (_req, _h, err) => {
	throw Boom.badRequest(err?.message);
};
