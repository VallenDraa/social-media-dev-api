import Joi from 'joi';
import { type ApiResponse, type ErrorApiResponse } from 'src/v1/models';

export const apiResponseValidator = Joi.object<ApiResponse<any>>({
	statusCode: Joi.number().required(),
	message: Joi.string().required(),
	data: Joi.string().required(),
});

export const errorApiResponseValidator = Joi.object<ErrorApiResponse>({
	statusCode: Joi.number().required(),
	error: Joi.string().required(),
	message: Joi.string().required(),
}).label('ErrorApiResponse');

// Swagger response examples
export const apiResponse = <T>(data: T, message: string, statusCode = 200) =>
	apiResponseValidator
		.example({ statusCode, message, data })
		.label('ApiResponse');

export const serverErrorApiResponse = errorApiResponseValidator
	.example({
		statusCode: 500,
		error: 'Internal Server Error',
		message: 'An internal server error occurred',
	})
	.label('ServerErrorApiResponse');

export const unauthorizedApiResponse = (message: string) =>
	errorApiResponseValidator
		.example({ statusCode: 401, error: 'Unauthorized', message })
		.label('UnauthorizedApiResponse');

export const badRequestApiResponse = (message: string) =>
	errorApiResponseValidator
		.example({ statusCode: 400, error: 'Bad request', message })
		.label('BadRequestApiResponse');

export const notFoundApiResponse = (message: string) =>
	errorApiResponseValidator
		.example({ statusCode: 404, error: 'Not Found', message })
		.label('NotFoundApiResponse');

export const conflictApiResponse = (message: string) =>
	errorApiResponseValidator
		.example({ statusCode: 409, error: 'Conflict', message })
		.label('ConflictApiResponse');
