export type ApiResponse<T> = {
	statusCode: number;
	message: string;
	data: T;
};

export type ErrorApiResponse = {
	statusCode: number;
	message: string;
	error: string;
};

export type ErrorApiResponseWithAttributes<T> = ErrorApiResponse & {
	attributes: T;
};

export type MetaData = {
	currentPage: number;
	lastPage: number;
	limit: number;
	total: number;
};
