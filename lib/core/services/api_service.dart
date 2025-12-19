import 'dart:convert';
import 'package:dio/dio.dart';
import '../config/app_config.dart';
import 'storage_service.dart';
import 'logger_service.dart';
import '../errors/app_exception.dart';

/// Professional API service with interceptors, error handling, and retry logic
class ApiService {
  late final Dio _dio;
  final LoggerService logger;
  final StorageService storage;

  ApiService({
    required Dio dio,
    required this.logger,
    required this.storage,
  }) {
    _dio = dio;
    _setupInterceptors();
  }

  void _setupInterceptors() {
    final baseUrl = AppConfig.apiBaseUrl;
    logger.info('Setting API base URL: $baseUrl', null);
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = Duration(milliseconds: AppConfig.apiTimeout);
    _dio.options.receiveTimeout = Duration(milliseconds: AppConfig.apiTimeout);

    // Request interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add authorization token
          final token = await storage.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          // Add common headers
          options.headers['Content-Type'] = 'application/json';
          options.headers['Accept'] = 'application/json';

          logger.logApiRequest(
            options.method,
            options.uri.toString(),
            data: options.data,
          );

          handler.next(options);
        },
        onResponse: (response, handler) {
          logger.logApiResponse(
            response.requestOptions.method,
            response.requestOptions.uri.toString(),
            response.statusCode ?? 0,
            data: response.data,
          );
          handler.next(response);
        },
        onError: (error, handler) async {
          logger.logApiError(
            error.requestOptions.method,
            error.requestOptions.uri.toString(),
            error,
          );

          // Handle token refresh on 401
          if (error.response?.statusCode == 401) {
            try {
              final refreshToken = await storage.getRefreshToken();
              if (refreshToken != null) {
                // Attempt to refresh token
                final response = await _dio.post(
                  '/auth/refresh',
                  data: {'refreshToken': refreshToken},
                );

                if (response.statusCode == 200) {
                  final newAccessToken = response.data['accessToken'];
                  await storage.saveAccessToken(newAccessToken);

                  // Retry original request
                  error.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                  final retryResponse = await _dio.fetch(error.requestOptions);
                  return handler.resolve(retryResponse);
                }
              }
            } catch (e) {
              logger.error('Token refresh failed', e);
              // Clear tokens and redirect to login
              await storage.clearTokens();
            }
          }

          handler.next(error);
        },
      ),
    );

    // Logging interceptor (if debug mode)
    if (AppConfig.debugMode) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
      ));
    }
  }

  // Generic GET request
  Future<T> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Generic POST request
  Future<T> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Generic PUT request
  Future<T> put<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Generic DELETE request
  Future<T> delete<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Generic PATCH request
  Future<T> patch<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.patch(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Upload file
  Future<T> uploadFile<T>(
    String endpoint,
    String filePath, {
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
        ...?data,
      });

      final response = await _dio.post(
        endpoint,
        data: formData,
        onSendProgress: onSendProgress,
      );
      return response.data as T;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Error handling
  AppException _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException('Connection timeout. Please check your internet connection.');

      case DioExceptionType.badResponse:
        return _handleResponseError(error.response);

      case DioExceptionType.cancel:
        return AppException('Request cancelled');

      case DioExceptionType.connectionError:
        return NetworkException('No internet connection');

      default:
        return AppException('Unexpected error occurred');
    }
  }

  AppException _handleResponseError(Response? response) {
    if (response == null) {
      return AppException('No response from server');
    }

    final statusCode = response.statusCode ?? 0;
    // Try to extract error message from different possible formats
    String message = 'An error occurred';
    if (response.data != null) {
      try {
        if (response.data is Map) {
          message = response.data['message'] ?? 
                    response.data['error'] ?? 
                    response.data.toString();
        } else if (response.data is String) {
          // Try to parse JSON string
          try {
            final parsed = json.decode(response.data);
            if (parsed is Map) {
              message = parsed['message'] ?? parsed['error'] ?? response.data;
            } else {
              message = response.data;
            }
          } catch (e) {
            message = response.data;
          }
        }
      } catch (e) {
        message = response.data.toString();
      }
    }

    switch (statusCode) {
      case 400:
        return BadRequestException(message);
      case 401:
        // For login, return a more specific message
        final lowerMessage = message.toLowerCase();
        if (lowerMessage.contains('authentication failed') || 
            lowerMessage.contains('incorrect') ||
            lowerMessage.contains('bad credentials')) {
          return UnauthorizedException('Email ou mot de passe incorrect');
        }
        return UnauthorizedException('Session expired. Please login again.');
      case 403:
        return ForbiddenException('You don\'t have permission to access this resource');
      case 404:
        return NotFoundException('Resource not found');
      case 500:
      case 501:
      case 502:
      case 503:
        return ServerException('Server error. Please try again later.');
      default:
        return AppException(message);
    }
  }
}
