/// Base exception class for all app exceptions
class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic originalError;

  AppException(this.message, {this.code, this.originalError});

  @override
  String toString() => message;
}

/// Network related exceptions
class NetworkException extends AppException {
  NetworkException(super.message, {super.code, super.originalError});
}

/// Authentication related exceptions
class UnauthorizedException extends AppException {
  UnauthorizedException(super.message, {super.code, super.originalError});
}

/// Permission related exceptions
class ForbiddenException extends AppException {
  ForbiddenException(super.message, {super.code, super.originalError});
}

/// Resource not found exceptions
class NotFoundException extends AppException {
  NotFoundException(super.message, {super.code, super.originalError});
}

/// Bad request exceptions
class BadRequestException extends AppException {
  BadRequestException(super.message, {super.code, super.originalError});
}

/// Server error exceptions
class ServerException extends AppException {
  ServerException(super.message, {super.code, super.originalError});
}

/// Validation exceptions
class ValidationException extends AppException {
  final Map<String, List<String>>? errors;

  ValidationException(super.message, {this.errors, super.code, super.originalError});
}

/// Cache exceptions
class CacheException extends AppException {
  CacheException(super.message, {super.code, super.originalError});
}

/// Parse exceptions
class ParseException extends AppException {
  ParseException(super.message, {super.code, super.originalError});
}
