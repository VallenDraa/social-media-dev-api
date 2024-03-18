import Joi from 'joi';
import { type CommentEdit, type Comment, type CommentCreate } from 'src/models';

export const createCommentValidator = Joi.object<CommentCreate, true>({
	content: Joi.string().required().messages({
		'any.required': 'Content is invalid or missing',
	}),
	post: Joi.string()
		.uuid()
		.required()
		.messages({ 'any.required': 'Post UUID is invalid or missing' }),
	owner: Joi.string()
		.uuid()
		.required()
		.messages({ 'any.required': 'Owner UUID invalid or missing' }),
	likes: Joi.array().items(Joi.string().uuid()).required().messages({
		'any.required': 'likes are invalid or missing',
	}),
	dislikes: Joi.array().items(Joi.string().uuid()).required().messages({
		'any.required': 'dislikes are invalid or missing',
	}),
	replies: Joi.array().items(Joi.string().uuid()).required().messages({
		'any.required': 'replies are invalid or missing',
	}),
});

export const editCommentValidator = Joi.object<CommentEdit, true>({
	content: Joi.string().required().messages({
		'any.required': 'Content is invalid or missing',
	}),
	likes: Joi.array().items(Joi.string().uuid()).required().messages({
		'any.required': 'likes are invalid or missing',
	}),
	dislikes: Joi.array().items(Joi.string().uuid()).required().messages({
		'any.required': 'dislikes are invalid or missing',
	}),
	replies: Joi.array().items(Joi.string().uuid()).required().messages({
		'any.required': 'replies are invalid or missing',
	}),
});

export const commentValidator = createCommentValidator.append<Comment>({
	id: Joi.string()
		.uuid()
		.required()
		.messages({ 'any.required': 'UUID is invalid or missing' }),
});
