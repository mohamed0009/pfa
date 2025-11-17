// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';
import 'package:pfa/core/models/user_model.dart';
import 'package:pfa/core/models/learning_module.dart';
import 'package:pfa/core/errors/app_exception.dart';
import 'package:pfa/core/errors/result.dart';

void main() {
  group('Model Tests', () {
    test('UserModel can be created and converted to/from JSON', () {
      final user = UserModel(
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.learner,
        createdAt: DateTime(2024, 1, 1),
      );

      expect(user.id, '123');
      expect(user.email, 'test@example.com');
      expect(user.name, 'Test User');
      expect(user.role, UserRole.learner);

      // Test JSON conversion
      final json = user.toJson();
      expect(json['id'], '123');
      expect(json['email'], 'test@example.com');

      final fromJson = UserModel.fromJson(json);
      expect(fromJson.id, user.id);
      expect(fromJson.email, user.email);
    });

    test('UserModel has correct roles', () {
      expect(UserRole.admin, isA<UserRole>());
      expect(UserRole.trainer, isA<UserRole>());
      expect(UserRole.learner, isA<UserRole>());
    });

    test('LearningModule can be created correctly', () {
      final module = LearningModule(
        id: 'mod1',
        title: 'Test Module',
        description: 'Test Description',
        level: 1,
        estimatedDuration: 30,
        topics: ['topic1', 'topic2'],
        createdAt: DateTime(2024, 1, 1),
      );

      expect(module.id, 'mod1');
      expect(module.title, 'Test Module');
      expect(module.level, 1);
      expect(module.estimatedDuration, 30);
      expect(module.topics.length, 2);
      expect(module.isCompleted, false);
      expect(module.progress, 0.0);
    });
  });

  group('Error Handling Tests', () {
    test('Result Success contains data', () {
      final result = Success<String>('test data');
      
      expect(result.isSuccess, true);
      expect(result.dataOrNull, 'test data');
      expect(result.errorOrNull, null);
    });

    test('Result Failure contains error', () {
      final result = Failure<String>('Network error');
      
      expect(result.isSuccess, false);
      expect(result.dataOrNull, null);
      expect(result.errorOrNull, 'Network error');
    });

    test('AppException hierarchy works correctly', () {
      final networkError = NetworkException('No internet');
      final authError = UnauthorizedException('Unauthorized');
      final validationError = ValidationException('Invalid email');
      final notFoundError = NotFoundException('User not found');

      expect(networkError, isA<AppException>());
      expect(authError, isA<AppException>());
      expect(validationError, isA<AppException>());
      expect(notFoundError, isA<AppException>());

      expect(networkError.message, 'No internet');
      expect(validationError.message, 'Invalid email');
      expect(notFoundError.message, 'User not found');
    });

    test('Result map transforms success data', () {
      final result = Success<int>(5);
      final mapped = result.map((data) => data * 2);
      
      expect(mapped.dataOrNull, 10);
    });

    test('Result map preserves failure message', () {
      final result = Failure<int>('Error');
      final mapped = result.map((data) => data * 2);
      
      // When map fails on a Failure, it returns the original failure message
      expect(mapped.errorOrNull, 'Error');
    });

    test('Result getOrElse returns default on failure', () {
      final result = Failure<int>('Error');
      final value = result.getOrElse(42);
      
      expect(value, 42);
    });

    test('Result getOrElse returns data on success', () {
      final result = Success<int>(100);
      final value = result.getOrElse(42);
      
      expect(value, 100);
    });

    test('Result onSuccess callback is called', () {
      var called = false;
      var receivedData = 0;
      
      final result = Success<int>(42);
      result.onSuccess((data) {
        called = true;
        receivedData = data;
      });
      
      expect(called, true);
      expect(receivedData, 42);
    });

    test('Result onFailure callback is called', () {
      var called = false;
      var receivedMessage = '';
      
      final result = Failure<int>('Test error');
      result.onFailure((message) {
        called = true;
        receivedMessage = message;
      });
      
      expect(called, true);
      expect(receivedMessage, 'Test error');
    });
  });
}
