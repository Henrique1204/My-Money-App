export interface User {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ApiResponse<T> {
	data: T;
	success: boolean;
	message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
