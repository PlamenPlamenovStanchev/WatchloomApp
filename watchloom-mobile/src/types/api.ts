export type ApiError = {
  message: string;
  statusCode?: number;
};

export type ApiResponse<T> = {
  data: T;
};
