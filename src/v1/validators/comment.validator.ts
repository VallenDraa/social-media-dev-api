import { faker } from '@faker-js/faker';
import Joi from 'joi';
import {
	type CommentEdit,
	type Comment,
	type CommentCreate,
} from 'src/v1/models';
import { emptyArray } from 'src/v1/utils/array-utils';

export const createCommentValidator = Joi.object<CommentCreate, true>({
	content: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Content is invalid or missing' })
		.example(faker.lorem.sentence()),
	owner: Joi.string()
		.trim()
		.uuid()
		.required()
		.messages({ 'any.required': 'Owner UUID invalid or missing' })
		.example(faker.string.uuid()),
});

export const editCommentValidator = Joi.object<CommentEdit, true>({
	content: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Content is invalid or missing' })
		.example(faker.lorem.sentence()),
	likes: Joi.array()
		.items(Joi.string().trim().uuid())
		.required()
		.messages({ 'any.required': 'likes are invalid or missing' })
		.example(emptyArray(3, () => faker.string.uuid())),
	dislikes: Joi.array()
		.items(Joi.string().trim().uuid())
		.required()
		.messages({ 'any.required': 'dislikes are invalid or missing' })
		.example(emptyArray(3, () => faker.string.uuid())),
	replies: Joi.array()
		.items(Joi.string().trim().uuid())
		.required()
		.messages({ 'any.required': 'replies are invalid or missing' })
		.example(emptyArray(3, () => faker.string.uuid())),
});

export const commentValidator = createCommentValidator.append<Comment>({
	id: Joi.string()
		.trim()
		.uuid()
		.required()
		.messages({ 'any.required': 'UUID is invalid or missing' })
		.example(faker.string.uuid()),
	createdAt: Joi.string().isoDate().required().example(faker.date.recent()),
	updatedAt: Joi.string().isoDate().required().example(faker.date.recent()),
});
