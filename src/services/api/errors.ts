export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class TimeoutError extends Error {
  constructor(message = 'The request took too long to finish.') {
    super(message);
    this.name = 'TimeoutError';
  }
}
