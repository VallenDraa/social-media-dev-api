import Joi from 'joi';
import { type MetaData } from 'src/v1/models';

export const paginateValidator = Joi.object({
	limit: Joi.number().min(1).example(10),
	page: Joi.number().min(1).example(1),
}).label('Paginate');

export const metadataValidator = Joi.object<MetaData>({
	currentPage: Joi.number().example(1),
	lastPage: Joi.number().example(1),
	limit: Joi.number().example(3),
	total: Joi.number().example(3),
}).label('MetaData');
