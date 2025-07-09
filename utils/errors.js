/**
 * Utilidades para el manejo de errores en la API
 */

// Crear un error personalizado con código de estado HTTP
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error 400 - Bad Request
class BadRequestError extends ApiError {
  constructor(message = 'Solicitud incorrecta') {
    super(message, 400);
  }
}

// Error 401 - Unauthorized
class UnauthorizedError extends ApiError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

// Error 403 - Forbidden
class ForbiddenError extends ApiError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403);
  }
}

// Error 404 - Not Found
class NotFoundError extends ApiError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

// Error 500 - Internal Server Error
class InternalServerError extends ApiError {
  constructor(message = 'Error interno del servidor') {
    super(message, 500);
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError
};
