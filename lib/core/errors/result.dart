import 'package:equatable/equatable.dart';

/// Result type for operations that can fail
sealed class Result<T> extends Equatable {
  const Result();
}

/// Success result with data
class Success<T> extends Result<T> {
  final T data;

  const Success(this.data);

  @override
  List<Object?> get props => [data];
}

/// Failure result with error
class Failure<T> extends Result<T> {
  final String message;
  final Exception? exception;

  const Failure(this.message, [this.exception]);

  @override
  List<Object?> get props => [message, exception];
}

/// Extension methods for Result
extension ResultExtension<T> on Result<T> {
  /// Check if result is success
  bool get isSuccess => this is Success<T>;

  /// Check if result is failure
  bool get isFailure => this is Failure<T>;

  /// Get data if success, null otherwise
  T? get dataOrNull => isSuccess ? (this as Success<T>).data : null;

  /// Get error message if failure, null otherwise
  String? get errorOrNull => isFailure ? (this as Failure<T>).message : null;

  /// Execute callback if success
  Result<T> onSuccess(void Function(T data) callback) {
    if (this is Success<T>) {
      callback((this as Success<T>).data);
    }
    return this;
  }

  /// Execute callback if failure
  Result<T> onFailure(void Function(String message) callback) {
    if (this is Failure<T>) {
      callback((this as Failure<T>).message);
    }
    return this;
  }

  /// Transform data if success
  Result<R> map<R>(R Function(T data) transform) {
    if (this is Success<T>) {
      try {
        return Success(transform((this as Success<T>).data));
      } catch (e) {
        return Failure('Transform failed: $e');
      }
    }
    return Failure((this as Failure<T>).message, (this as Failure<T>).exception);
  }

  /// Get data or throw exception
  T getOrThrow() {
    if (this is Success<T>) {
      return (this as Success<T>).data;
    }
    throw (this as Failure<T>).exception ?? Exception((this as Failure<T>).message);
  }

  /// Get data or default value
  T getOrElse(T defaultValue) {
    if (this is Success<T>) {
      return (this as Success<T>).data;
    }
    return defaultValue;
  }

  /// Get data or compute default value
  T getOrElseCompute(T Function() compute) {
    if (this is Success<T>) {
      return (this as Success<T>).data;
    }
    return compute();
  }
}
