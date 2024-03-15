/* eslint-disable @typescript-eslint/naming-convention */
import Joi from 'joi';
import { type Post, type PostCreate } from '../models';

export const createPostValidator = Joi.object<PostCreate, true>({
	description: Joi.string().required().messages({
		'any.required': 'Description is required',
	}),
	likes: Joi.array()
		.items(Joi.string().uuid())
		.required()
		.messages({ 'any.required': 'Likes are invalid' }),
	dislikes: Joi.array()
		.items(Joi.string().uuid())
		.required()
		.messages({ 'any.required': 'Dislikes are invalid' }),
	images: Joi.array()
		.items(Joi.string().uri())
		.required()
		.messages({ 'any.required': 'Images are invalid' }),
	owner: Joi.string()
		.uuid()
		.required()
		.messages({ 'any.required': 'Owner is invalid' }),
	createdAt: Joi.string()
		.isoDate()
		.required()
		.messages({ 'any.required': 'createdAt is invalid' }),
	updatedAt: Joi.string()
		.isoDate()
		.required()
		.messages({ 'any.required': 'updatedAt is invalid' }),
});

export const postValidator = createPostValidator.append<Post>({
	id: Joi.string()
		.uuid()
		.required()
		.messages({ 'any.required': 'Invalid UUID format' }),
});
