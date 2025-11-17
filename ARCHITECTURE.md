# Architecture Documentation

## Overview

This Flutter application follows **Clean Architecture** principles with a feature-based folder structure, ensuring scalability, maintainability, and testability.

## Architecture Layers

### 1. Presentation Layer (`features/*/presentation/`)
- **Responsibility**: UI and user interaction
- **Contains**: Screens, widgets, state management
- **Dependencies**: Can depend on domain and data layers

### 2. Domain Layer (`core/models/`, business logic in services)
- **Responsibility**: Business logic and entities
- **Contains**: Models, use cases, repository interfaces
- **Dependencies**: No dependencies on other layers

### 3. Data Layer (`core/services/`)
- **Responsibility**: Data access and external services
- **Contains**: API clients, local storage, repositories
- **Dependencies**: Can depend on domain layer

## Project Structure

```
lib/
├── core/
│   ├── config/           # App configuration (env, constants)
│   ├── di/               # Dependency injection setup
│   ├── errors/           # Error handling (exceptions, result types)
│   ├── models/           # Domain models (entities)
│   ├── providers/        # State management (Provider)
│   ├── routes/           # Navigation and routing
│   ├── services/         # Core services (API, storage, logging)
│   ├── theme/            # App theming and design tokens
│   └── utils/            # Utilities (responsive, validators, etc.)
│
├── features/             # Feature modules
│   ├── auth/
│   │   └── presentation/
│   │       ├── login_screen.dart
│   │       └── register_screen.dart
│   ├── chat/
│   │   └── presentation/
│   │       └── chat_screen.dart
│   ├── dashboard/
│   │   └── presentation/
│   │       ├── learner_dashboard.dart
│   │       ├── trainer_dashboard.dart
│   │       └── admin_dashboard.dart
│   ├── learning/
│   │   └── presentation/
│   │       └── learning_modules_screen.dart
│   └── profile/
│       └── presentation/
│           └── profile_screen.dart
│
├── widgets/              # Reusable widgets
│   ├── custom_button.dart
│   ├── custom_card.dart
│   └── custom_text_field.dart
│
└── main.dart             # App entry point
```

## Key Design Patterns

### 1. Dependency Injection
Using **GetIt** for service location and dependency injection:

```dart
// Setup in core/di/dependency_injection.dart
final getIt = GetIt.instance;

// Register services
getIt.registerLazySingleton<ApiService>(() => ApiService());

// Use in widgets
final apiService = getIt<ApiService>();
```

### 2. Repository Pattern
Services act as repositories for data access:

```dart
class AuthService {
  final ApiService _api;
  final StorageService _storage;
  
  Future<Result<User>> login(String email, String password) async {
    try {
      final response = await _api.post('/auth/login', data: {...});
      final user = User.fromJson(response);
      await _storage.saveUser(user);
      return Success(user);
    } catch (e) {
      return Failure('Login failed: $e');
    }
  }
}
```

### 3. Provider Pattern
Using Provider for state management:

```dart
class UserProvider with ChangeNotifier {
  User? _currentUser;
  
  User? get currentUser => _currentUser;
  
  Future<void> login(String email, String password) async {
    final result = await _authService.login(email, password);
    result.onSuccess((user) {
      _currentUser = user;
      notifyListeners();
    });
  }
}
```

### 4. Result Pattern
Type-safe error handling:

```dart
sealed class Result<T> {}
class Success<T> extends Result<T> { final T data; }
class Failure<T> extends Result<T> { final String message; }

// Usage
final result = await service.getData();
result
  .onSuccess((data) => print('Success: $data'))
  .onFailure((error) => print('Error: $error'));
```

## Responsive Design

### Breakpoints
- **Mobile**: < 600px
- **Tablet**: 600px - 900px
- **Desktop**: 900px - 1200px
- **Wide**: > 1200px

### Usage
```dart
// Get responsive value
final padding = Responsive.valueWhen(
  context: context,
  mobile: 16.0,
  tablet: 24.0,
  desktop: 32.0,
);

// Build different layouts
Responsive.builder(
  context: context,
  builder: (context, deviceType) {
    if (deviceType == DeviceType.mobile) {
      return MobileLayout();
    }
    return DesktopLayout();
  },
);
```

## API Integration

### HTTP Client (Dio)
Configured with interceptors for:
- Authorization headers
- Request/response logging
- Token refresh on 401
- Error handling

```dart
// Usage
final response = await apiService.get<Map<String, dynamic>>('/users/me');
final user = User.fromJson(response);
```

## Storage

### Secure Storage
For sensitive data (tokens, credentials):
```dart
await storage.saveAccessToken(token);
final token = await storage.getAccessToken();
```

### Regular Storage
For non-sensitive data:
```dart
await storage.write('key', value);
final value = storage.read<String>('key');
```

## Error Handling

### Custom Exceptions
```dart
try {
  await apiService.get('/data');
} on NetworkException catch (e) {
  // Handle network error
} on UnauthorizedException catch (e) {
  // Handle auth error
} on AppException catch (e) {
  // Handle generic error
}
```

## Testing Strategy

### 1. Unit Tests
Test individual functions, services, and models:
```dart
test('AuthService login returns success', () async {
  final result = await authService.login('test@test.com', 'password');
  expect(result.isSuccess, true);
});
```

### 2. Widget Tests
Test individual widgets and their behavior:
```dart
testWidgets('CustomButton shows loading', (tester) async {
  await tester.pumpWidget(CustomButton(
    text: 'Submit',
    isLoading: true,
    onPressed: () {},
  ));
  expect(find.byType(CircularProgressIndicator), findsOneWidget);
});
```

### 3. Integration Tests
Test complete user flows:
```dart
testWidgets('Login flow', (tester) async {
  await tester.pumpWidget(MyApp());
  await tester.enterText(find.byType(TextField).first, 'user@test.com');
  await tester.tap(find.text('Login'));
  await tester.pumpAndSettle();
  expect(find.text('Dashboard'), findsOneWidget);
});
```

## Performance Optimization

### 1. Image Caching
```dart
CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)
```

### 2. Lazy Loading
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
)
```

### 3. Code Splitting
Use deferred loading for large features:
```dart
import 'large_feature.dart' deferred as large;

// Later
await large.loadLibrary();
large.showFeature();
```

## Security Best Practices

1. **Never commit sensitive data** (API keys, tokens)
2. **Use .env files** for configuration
3. **Store tokens securely** using FlutterSecureStorage
4. **Validate all user input**
5. **Use HTTPS** for all API calls
6. **Implement proper authentication** with token refresh
7. **Handle errors gracefully** without exposing sensitive information

## Deployment

### Development
```bash
flutter run --dart-define=ENV=development
```

### Production
```bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release

# Web
flutter build web --release --web-renderer canvaskit
```

## Code Style Guide

### Naming Conventions
- **Classes**: PascalCase (`UserProvider`, `LoginScreen`)
- **Files**: snake_case (`user_provider.dart`, `login_screen.dart`)
- **Variables**: camelCase (`currentUser`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Private members**: prefix with `_` (`_fetchData`, `_userId`)

### File Organization
1. Imports (dart, flutter, packages, local)
2. Class definition
3. Fields
4. Constructor
5. Lifecycle methods
6. Public methods
7. Private methods
8. Build method (for widgets)

### Comments
- Use `///` for public API documentation
- Use `//` for implementation comments
- Keep comments concise and meaningful
- Document complex logic

## Contributing

1. Create a feature branch
2. Follow the architecture patterns
3. Write tests for new features
4. Run `flutter analyze` and `flutter test`
5. Update documentation
6. Submit a pull request

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Provider Package](https://pub.dev/packages/provider)
- [Dio HTTP Client](https://pub.dev/packages/dio)
