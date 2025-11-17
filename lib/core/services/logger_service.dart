import 'package:logger/logger.dart';

/// Professional logging service with different log levels
class LoggerService {
  final Logger _logger;

  LoggerService(this._logger);

  void verbose(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.t(message, error: error, stackTrace: stackTrace);
  }

  void debug(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.d(message, error: error, stackTrace: stackTrace);
  }

  void info(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.i(message, error: error, stackTrace: stackTrace);
  }

  void warning(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.w(message, error: error, stackTrace: stackTrace);
  }

  void error(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.e(message, error: error, stackTrace: stackTrace);
  }

  void fatal(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.f(message, error: error, stackTrace: stackTrace);
  }

  // API Request/Response logging
  void logApiRequest(String method, String url, {Map<String, dynamic>? data}) {
    info('API Request: $method $url', data);
  }

  void logApiResponse(String method, String url, int statusCode, {dynamic data}) {
    info('API Response: $method $url - Status: $statusCode', data);
  }

  void logApiError(String method, String url, dynamic error, [StackTrace? stackTrace]) {
    this.error('API Error: $method $url', error, stackTrace);
  }

  // User action logging
  void logUserAction(String action, {Map<String, dynamic>? metadata}) {
    info('User Action: $action', metadata);
  }

  // Navigation logging
  void logNavigation(String from, String to) {
    debug('Navigation: $from -> $to');
  }
}
