import Joi from 'joi';

export const idValidator = Joi.object({
	id: Joi.string()
		.trim()
		.uuid()
		.required()
		.messages({ 'any.required': 'UUID is invalid or missing' }),
});

export const postIdValidator = Joi.object({
	postId: Joi.string()
		.trim()
		.uuid()
		.required()
		.messages({ 'any.required': 'UUID is invalid or missing' }),
});
