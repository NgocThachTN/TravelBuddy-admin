export interface BePagedWrapper<T> {
  success: boolean;
  data: {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface BeWrapper<T> {
  success: boolean;
  data: T;
}
