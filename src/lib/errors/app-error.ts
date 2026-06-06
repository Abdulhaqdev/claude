export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 422, "VALIDATION_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

export function handleError(error: unknown): {
  message: string;
  statusCode: number;
  code?: string;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    if (error.message === "NEXT_REDIRECT" || error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("[Error]", error.message, error.stack);

    if (
      error.name === "PrismaClientInitializationError" ||
      error.message.includes("Authentication failed against database server") ||
      error.message.includes("Can't reach database server")
    ) {
      return {
        message:
          "Database is unavailable. Start it with: docker compose up postgres redis -d && npm run db:push",
        statusCode: 503,
        code: "DATABASE_UNAVAILABLE",
      };
    }

    return {
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
      statusCode: 500,
      code: "INTERNAL_ERROR",
    };
  }

  return {
    message: "Internal server error",
    statusCode: 500,
    code: "INTERNAL_ERROR",
  };
}
