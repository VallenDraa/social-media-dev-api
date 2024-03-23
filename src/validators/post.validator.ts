import Joi from 'joi';
import { type PostEdit, type PostCreate } from 'src/models';
import { paginateValidator } from './paginate.validator';

export const createPostValidator = Joi.object<PostCreate, true>({
	description: Joi.string().trim().required().messages({
		'any.required': 'Description is invalid or missing',
	}),
	likes: Joi.array()
		.items(Joi.string().trim().uuid())
		.required()
		.messages({ 'any.required': 'Likes are invalid or missing' }),
	dislikes: Joi.array()
		.items(Joi.string().trim().uuid())
		.required()
		.messages({ 'any.required': 'Dislikes are invalid or missing' }),
	images: Joi.array()
		.items(Joi.string().trim().uri())
		.required()
		.messages({ 'any.required': 'Images are invalid or missing' }),
	owner: Joi.string()
		.trim()
		.uuid()
		.required()
		.messages({ 'any.required': 'Owner is invalid or missing' }),
});

export const editPostValidator = Joi.object<PostEdit, true>({
	description: Joi.string().trim().required().messages({
		'any.required': 'Description is invalid or missing',
	}),
	likes: Joi.array()
		.items(Joi.string().trim().uuid())
		.required()
		.messages({ 'any.required': 'Likes are invalid or missing' }),
	dislikes: Joi.array()
		.items(Joi.string().trim().uuid())
		.required()
		.messages({ 'any.required': 'Dislikes are invalid or missing' }),
	images: Joi.array()
		.items(Joi.string().trim().uri())
		.required()
		.messages({ 'any.required': 'Images are invalid or missing' }),
});

export const postValidator = createPostValidator.append({
	id: Joi.string()
		.trim()
		.uuid()
		.required()
		.messages({ 'any.required': 'UUID is invalid or missing' }),
});

export const searchPostValidator = paginateValidator.append({
	'with-top-comments': Joi.boolean(),
	'has-comments': Joi.boolean(),
});
