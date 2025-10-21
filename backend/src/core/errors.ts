export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'APP_ERROR',
    public readonly status: number = 400,
    public readonly details?: unknown
  ) {
    super(message);
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 'BAD_REQUEST', 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(msg = 'Not found', details?: unknown) {
    super(msg, 'NOT_FOUND', 404, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized', details?: unknown) {
    super(msg, 'UNAUTHORIZED', 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden', details?: unknown) {
    super(msg, 'FORBIDDEN', 403, details);
  }
}

export class ConflictError extends AppError {
  constructor(msg = 'Conflict', details?: unknown) {
    super(msg, 'CONFLICT', 409, details);
  }
}
