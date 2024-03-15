import { type MetaData } from '../models';

export const paginateService = {
	paginate<T>(
		array: T[],
		limit = 10,
		page = 1,
	): { data: T[]; metadata: MetaData } {
		const start = (page - 1) * limit;
		const end = page * limit;

		return {
			data: array.slice(start, end),
			metadata: {
				currentPage: page,
				lastPage: Math.ceil(array.length / limit),
				limit,
				total: array.length,
			},
		};
	},
};
