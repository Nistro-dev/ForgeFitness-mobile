export class AppError extends Error {
    code;
    status;
    details;
    constructor(message, code = 'APP_ERROR', status = 400, details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}
export class NotFoundError extends AppError {
    constructor(msg = 'Not found', details) {
        super(msg, 'NOT_FOUND', 404, details);
    }
}
export class UnauthorizedError extends AppError {
    constructor(msg = 'Unauthorized', details) {
        super(msg, 'UNAUTHORIZED', 401, details);
    }
}
export class ForbiddenError extends AppError {
    constructor(msg = 'Forbidden', details) {
        super(msg, 'FORBIDDEN', 403, details);
    }
}
export class ConflictError extends AppError {
    constructor(msg = 'Conflict', details) {
        super(msg, 'CONFLICT', 409, details);
    }
}
