import { faker } from '@faker-js/faker';
import Joi from 'joi';
import {
	type UserCreate,
	type User,
	type UserEdit,
	type UpdateUserPassword,
	type UserWithoutPassword,
} from 'src/v1/models';

export const createUserValidator = Joi.object<UserCreate, true>({
	profilePicture: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Profile picture is invalid or missing' })
		.example(faker.image.avatar()),
	username: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Username is invalid or missing' })
		.example(faker.internet.userName()),
	email: Joi.string()
		.trim()
		.email()
		.required()
		.messages({ 'any.required': 'Email is invalid or missing' })
		.example(faker.internet.email()),
	password: Joi.string()
		.trim()
		.min(8)
		.required()
		.messages({ 'any.required': 'Password is invalid or missing' })
		.example('password1234'),
}).label('CreateUser');

export const editUserValidator = Joi.object<UserEdit, true>({
	profilePicture: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Profile picture is invalid or missing' })
		.example(faker.image.avatar()),
	username: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Username is invalid or missing' })
		.example(faker.internet.userName()),
	email: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Email is invalid or missing' })
		.example(faker.internet.email()),
}).label('EditUser');

export const editUserPasswordValidator = Joi.object<UpdateUserPassword, true>({
	oldPassword: Joi.string()
		.trim()
		.min(8)
		.required()
		.messages({ 'any.required': 'Old password is invalid or missing' })
		.example('Oldpassword1234'),
	newPassword: Joi.string()
		.trim()
		.min(8)
		.required()
		.messages({ 'any.required': 'New password is invalid or missing' })
		.example('Newpassword1234'),
}).label('EditUserPassword');

export const userValidator = createUserValidator
	.append<User>({
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
	.label('UserValidator');

export const userWithoutPasswordValidator = Joi.object<
	UserWithoutPassword,
	true
>({
	id: Joi.string()
		.trim()
		.uuid()
		.required()
		.messages({ 'any.required': 'UUID is invalid or missing' })
		.example(faker.string.uuid()),
	profilePicture: Joi.string()
		.email()
		.required()
		.messages({ 'any.required': 'Profile picture is invalid or missing' })
		.example(faker.image.avatar()),
	username: Joi.string()
		.email()
		.required()
		.messages({ 'any.required': 'Username is invalid or missing' })
		.example(faker.internet.userName()),
	email: Joi.string()
		.email()
		.required()
		.messages({ 'any.required': 'Email is invalid or missing' })
		.example(faker.internet.email()),
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
}).label('UserWithoutPassword');
