export interface CommonResponseInterface<T> {
    data: T;
    message: string;
    status: number;
    timestamp: Date;
}

// Define pagination response interface
export interface PaginatedResponse<T> {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  }