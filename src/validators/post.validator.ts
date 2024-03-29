import Joi from 'joi';
import { type PostEdit, type PostCreate } from 'src/models';
import { paginateValidator } from './paginate.validator';
import { faker } from '@faker-js/faker';
import { emptyArray } from 'src/utils/array-utils';

export const createPostValidator = Joi.object<PostCreate, true>({
	description: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Description is invalid or missing' })
		.example(faker.lorem.sentence()),
	images: Joi.array()
		.items(Joi.string().trim().uri())
		.required()
		.messages({ 'any.required': 'Images are invalid or missing' })
		.example(emptyArray(3, faker.image.url)),
}).label('CreatePost');

export const editPostValidator = Joi.object<PostEdit, true>({
	description: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Description is invalid or missing' })
		.example(faker.lorem.sentence()),
	likes: Joi.array()
		.items(Joi.string().trim().uuid())
		.required()
		.messages({ 'any.required': 'Likes are invalid or missing' })
		.example(emptyArray(3, faker.string.uuid)),
	dislikes: Joi.array()
		.items(Joi.string().trim().uuid())
		.required()
		.messages({ 'any.required': 'Dislikes are invalid or missing' })
		.example(emptyArray(3, faker.string.uuid)),
	images: Joi.array()
		.items(Joi.string().trim().uri())
		.required()
		.messages({ 'any.required': 'Images are invalid or missing' })
		.example(emptyArray(3, faker.image.url)),
}).label('EditPost');

export const postValidator = createPostValidator
	.append({
		id: Joi.string()
			.trim()
			.uuid()
			.required()
			.messages({ 'any.required': 'UUID is invalid or missing' })
			.example(faker.string.uuid()),
		createdAt: Joi.string()
			.isoDate()
			.required()
			.messages({ 'any.required': 'createdAt is invalid or missing' })
			.example(faker.date.recent()),
		updatedAt: Joi.string()
			.isoDate()
			.required()
			.messages({ 'any.required': 'updatedAt is invalid or missing' })
			.example(faker.date.recent()),
	})
	.label('Post');

export const searchPostValidator = paginateValidator
	.append({
		'with-top-comments': Joi.boolean().example(false),
		'has-comments': Joi.boolean().example(false),
	})
	.label('SearchPost');
