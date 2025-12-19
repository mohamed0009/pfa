# 🏗️ Architecture du Projet - Implémentation Détaillée

## 📖 Table des Matières
1. [Vue d'Ensemble](#vue-densemble)
2. [Point d'Entrée (main.dart)](#1-point-dentrée-maindart)
3. [Injection de Dépendances](#2-injection-de-dépendances-di)
4. [Couche de Données (Data Layer)](#3-couche-de-données-data-layer)
5. [Couche Domaine (Domain Layer)](#4-couche-domaine-domain-layer)
6. [Couche Présentation (Presentation Layer)](#5-couche-présentation-presentation-layer)
7. [Gestion d'État (State Management)](#6-gestion-détat-state-management)
8. [Navigation & Routing](#7-navigation--routing)
9. [Thème & Design System](#8-thème--design-system)
10. [Flux de Données Complet](#9-flux-de-données-complet)

---

## Vue d'Ensemble

L'application suit **Clean Architecture** avec 3 couches principales :

```
┌─────────────────────────────────────────┐
│   PRESENTATION LAYER (UI)               │
│   - Screens (LoginScreen, etc.)         │
│   - Widgets (CustomButton, etc.)        │
│   - State (Provider)                    │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   DOMAIN LAYER (Business Logic)         │
│   - Models (UserModel, etc.)            │
│   - Errors (Result pattern)             │
│   - Business Rules                      │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│   DATA LAYER (Data Access)              │
│   - Services (AuthService, etc.)        │
│   - API Client (ApiService)             │
│   - Storage (StorageService)            │
└─────────────────────────────────────────┘
```

---

## 1. Point d'Entrée (main.dart)

### 📍 Emplacement : `lib/main.dart`

### 🎯 Rôle
- Initialiser l'application
- Configurer l'injection de dépendances
- Setup de la gestion d'état
- Configuration du thème et de la navigation

### 💻 Implémentation Réelle

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Initialiser la configuration (variables d'environnement)
  await AppConfig.initialize();

  // 2. Setup de l'injection de dépendances (GetIt)
  await setupDependencyInjection();

  // 3. Lancer l'application
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      // 4. Providers globaux pour la gestion d'état
      providers: [
        ChangeNotifierProvider(create: (_) => getIt<UserProvider>()),
      ],
      child: MaterialApp(
        title: 'Coach Virtuel - PFA',
        debugShowCheckedModeBanner: false,
        
        // 5. Thème light et dark
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        
        // 6. Configuration de la navigation
        initialRoute: AppRoutes.splash,
        onGenerateRoute: AppRoutes.generateRoute,
        home: const SplashScreen(),
      ),
    );
  }
}
```

### 🔑 Points Clés
- **Ligne 14** : `await AppConfig.initialize()` charge les variables d'environnement (.env)
- **Ligne 17** : `await setupDependencyInjection()` enregistre tous les services
- **Ligne 29** : `getIt<UserProvider>()` récupère le provider via injection
- **Ligne 34-36** : Support du mode sombre automatique
- **Ligne 38-39** : Configuration du système de navigation

---

## 2. Injection de Dépendances (DI)

### 📍 Emplacement : `lib/core/di/dependency_injection.dart`

### 🎯 Rôle
- Créer une instance unique de chaque service (Singleton)
- Gérer les dépendances entre services
- Faciliter les tests (mock)

### 💻 Implémentation Réelle

```dart
import 'package:get_it/get_it.dart';

final getIt = GetIt.instance;

Future<void> setupDependencyInjection() async {
  // 1. LOGGING SERVICE (pas de dépendances)
  getIt.registerLazySingleton<Logger>(() => Logger(
    printer: PrettyPrinter(
      methodCount: 2,
      errorMethodCount: 8,
      colors: true,
      printEmojis: true,
    ),
  ));

  getIt.registerLazySingleton<LoggerService>(
    () => LoggerService(getIt<Logger>()),
  );

  // 2. STORAGE (pas de dépendances)
  final prefs = await SharedPreferences.getInstance();
  getIt.registerLazySingleton<SharedPreferences>(() => prefs);
  
  getIt.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true),
      iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
    ),
  );

  getIt.registerLazySingleton<StorageService>(
    () => StorageService(
      secureStorage: getIt<FlutterSecureStorage>(),
      sharedPreferences: getIt<SharedPreferences>(),
    ),
  );

  // 3. NETWORK (dépend de Storage et Logger)
  getIt.registerLazySingleton<Dio>(() {
    final dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
    ));
    return dio;
  });

  getIt.registerLazySingleton<ApiService>(
    () => ApiService(
      dio: getIt<Dio>(),
      logger: getIt<LoggerService>(),
      storage: getIt<StorageService>(),
    ),
  );

  // 4. BUSINESS SERVICES (dépendent d'ApiService)
  getIt.registerLazySingleton<AuthService>(
    () => AuthService(
      storage: getIt<StorageService>(),
      apiService: getIt<ApiService>(),
      logger: getIt<LoggerService>(),
    ),
  );

  getIt.registerLazySingleton<AICoachService>(
    () => AICoachService(
      apiService: getIt<ApiService>(),
      logger: getIt<LoggerService>(),
    ),
  );

  getIt.registerLazySingleton<LearningService>(
    () => LearningService(
      storage: getIt<StorageService>(),
      logger: getIt<LoggerService>(),
    ),
  );

  // 5. PROVIDERS (dépendent des services)
  getIt.registerLazySingleton<UserProvider>(
    () => UserProvider(authService: getIt<AuthService>()),
  );
}
```

### 🔑 Points Clés
- **registerLazySingleton** : Crée l'instance à la première utilisation
- **Ordre important** : Services sans dépendances → Services dépendants
- **getIt<T>()** : Récupère une instance enregistrée
- Facilite les tests : on peut remplacer par des mocks

### 📊 Graphe de Dépendances

```
Logger
  └─> LoggerService

SharedPreferences + FlutterSecureStorage
  └─> StorageService

Dio + LoggerService + StorageService
  └─> ApiService
       ├─> AuthService (+ StorageService + LoggerService)
       ├─> AICoachService (+ LoggerService)
       ├─> LearningService (+ StorageService + LoggerService)
       └─> ConversationService (+ LoggerService)

AuthService
  └─> UserProvider
```

---

## 3. Couche de Données (Data Layer)

### 📍 Emplacement : `lib/core/services/`

### 🎯 Rôle
- Communication avec le backend (API REST)
- Stockage local (préférences, tokens)
- Gestion des erreurs réseau
- Retry logic et timeout

### 💻 Implémentation - ApiService

```dart
class ApiService {
  final Dio dio;
  final LoggerService logger;
  final StorageService storage;

  ApiService({required this.dio, required this.logger, required this.storage}) {
    _setupInterceptors();
  }

  // Configuration des intercepteurs
  void _setupInterceptors() {
    dio.interceptors.add(InterceptorsWrapper(
      // AVANT chaque requête
      onRequest: (options, handler) async {
        // 1. Ajouter le token JWT automatiquement
        final token = await storage.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        
        // 2. Logger la requête
        logger.debug('REQUEST [${options.method}] ${options.uri}');
        return handler.next(options);
      },

      // APRÈS réception de la réponse
      onResponse: (response, handler) {
        logger.debug('RESPONSE [${response.statusCode}] ${response.requestOptions.uri}');
        return handler.next(response);
      },

      // EN CAS d'erreur
      onError: (error, handler) async {
        logger.error('ERROR [${error.response?.statusCode}] ${error.requestOptions.uri}');
        
        // 3. Refresh automatique du token si 401
        if (error.response?.statusCode == 401) {
          // Token expiré, essayer de refresh
          try {
            final refreshToken = await storage.getRefreshToken();
            if (refreshToken != null) {
              final newToken = await _refreshToken(refreshToken);
              await storage.saveAccessToken(newToken);
              
              // Réessayer la requête originale
              final opts = error.requestOptions;
              opts.headers['Authorization'] = 'Bearer $newToken';
              final response = await dio.fetch(opts);
              return handler.resolve(response);
            }
          } catch (e) {
            // Refresh échoué, déconnecter l'utilisateur
            await storage.deleteTokens();
          }
        }
        
        return handler.next(error);
      },
    ));
  }

  // Méthode GET générique
  Future<T> get<T>(String endpoint, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await dio.get(
        '${AppConfig.apiUrl}$endpoint',
        queryParameters: queryParameters,
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Méthode POST générique
  Future<T> post<T>(String endpoint, {dynamic data}) async {
    try {
      final response = await dio.post(
        '${AppConfig.apiUrl}$endpoint',
        data: data,
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
}
```

### 💻 Implémentation - AuthService

```dart
class AuthService {
  final StorageService storage;
  final ApiService apiService;
  final LoggerService logger;

  AuthService({required this.storage, required this.apiService, required this.logger});

  // Login avec Result pattern
  Future<Result<UserModel>> login(String email, String password) async {
    try {
      // 1. Appel API
      final response = await apiService.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });

      // 2. Extraction des tokens
      final accessToken = response['accessToken'];
      final refreshToken = response['refreshToken'];

      // 3. Sauvegarde sécurisée
      await storage.saveAccessToken(accessToken);
      await storage.saveRefreshToken(refreshToken);

      // 4. Conversion en UserModel
      final user = UserModel.fromJson(response['user']);

      // 5. Sauvegarde de l'utilisateur
      await storage.saveUser(user);

      logger.info('Login successful for ${user.email}');
      
      // 6. Retour succès
      return Success(user);
      
    } on NetworkException catch (e) {
      logger.error('Login failed: Network error');
      return Failure('Erreur réseau. Vérifiez votre connexion.');
    } on UnauthorizedException catch (e) {
      logger.error('Login failed: Invalid credentials');
      return Failure('Email ou mot de passe incorrect.');
    } catch (e) {
      logger.error('Login failed: $e');
      return Failure('Une erreur est survenue.');
    }
  }

  // Logout
  Future<void> logout() async {
    await storage.deleteTokens();
    await storage.deleteUser();
    logger.info('User logged out');
  }
}
```

### 🔑 Points Clés
- **Intercepteurs Dio** : Ajoutent automatiquement le token JWT
- **Retry Logic** : Refresh automatique du token si 401
- **Result Pattern** : Type-safe error handling (Success/Failure)
- **Logging** : Toutes les requêtes sont loggées
- **Sécurité** : Tokens stockés dans FlutterSecureStorage (encryp)

---

## 4. Couche Domaine (Domain Layer)

### 📍 Emplacement : `lib/core/models/` et `lib/core/errors/`

### 🎯 Rôle
- Définir les entités métier
- Validation business
- Gestion des erreurs type-safe

### 💻 Implémentation - UserModel

```dart
enum UserRole {
  admin,
  trainer,
  learner,
}

class UserModel {
  final String id;
  final String email;
  final String name;
  final String? formation;
  final String? level;
  final UserRole role;
  final Map<String, dynamic> preferences;
  final DateTime createdAt;
  final DateTime? lastLogin;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.formation,
    this.level,
    required this.role,
    this.preferences = const {},
    required this.createdAt,
    this.lastLogin,
  });

  // Désérialisation JSON → Model
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      formation: json['formation'],
      level: json['level'],
      role: UserRole.values.firstWhere(
        (e) => e.toString() == 'UserRole.${json['role']}',
        orElse: () => UserRole.learner,
      ),
      preferences: json['preferences'] ?? {},
      createdAt: DateTime.parse(json['createdAt']),
      lastLogin: json['lastLogin'] != null 
          ? DateTime.parse(json['lastLogin']) 
          : null,
    );
  }

  // Sérialisation Model → JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'formation': formation,
      'level': level,
      'role': role.toString().split('.').last,
      'preferences': preferences,
      'createdAt': createdAt.toIso8601String(),
      'lastLogin': lastLogin?.toIso8601String(),
    };
  }

  // Immutabilité : créer une copie modifiée
  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? formation,
    String? level,
    UserRole? role,
    Map<String, dynamic>? preferences,
    DateTime? createdAt,
    DateTime? lastLogin,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      formation: formation ?? this.formation,
      level: level ?? this.level,
      role: role ?? this.role,
      preferences: preferences ?? this.preferences,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
    );
  }
}
```

### 💻 Implémentation - Result Pattern

```dart
// Type scellé pour Success ou Failure
sealed class Result<T> extends Equatable {
  const Result();
}

// Succès avec données
class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
  
  @override
  List<Object?> get props => [data];
}

// Échec avec message d'erreur
class Failure<T> extends Result<T> {
  final String message;
  final Exception? exception;
  
  const Failure(this.message, [this.exception]);
  
  @override
  List<Object?> get props => [message, exception];
}

// Extensions pour faciliter l'utilisation
extension ResultExtension<T> on Result<T> {
  // Vérifier le type
  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is Failure<T>;

  // Récupérer les données
  T? get dataOrNull => isSuccess ? (this as Success<T>).data : null;
  String? get errorOrNull => isFailure ? (this as Failure<T>).message : null;

  // Callbacks
  Result<T> onSuccess(void Function(T data) callback) {
    if (this is Success<T>) {
      callback((this as Success<T>).data);
    }
    return this;
  }

  Result<T> onFailure(void Function(String message) callback) {
    if (this is Failure<T>) {
      callback((this as Failure<T>).message);
    }
    return this;
  }

  // Transformation
  Result<R> map<R>(R Function(T data) transform) {
    if (this is Success<T>) {
      try {
        return Success(transform((this as Success<T>).data));
      } catch (e) {
        return Failure('Transform failed: $e');
      }
    }
    return Failure((this as Failure<T>).message);
  }
}
```

### 🔑 Points Clés
- **Immutabilité** : Utiliser `copyWith` pour modifier
- **Type Safety** : `sealed class` garantit Success ou Failure
- **fromJson/toJson** : Communication avec le backend
- **Extensions** : Méthodes utilitaires (onSuccess, onFailure, map)

---

## 5. Couche Présentation (Presentation Layer)

### 📍 Emplacement : `lib/features/*/presentation/` et `lib/widgets/`

### 🎯 Rôle
- Afficher l'UI
- Gérer les interactions utilisateur
- Consommer les providers
- Naviguer entre les écrans

### 💻 Implémentation - LoginScreen

```dart
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // 1. Controllers pour les champs de texte
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    // Libérer les ressources
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // 2. Logique de connexion
  Future<void> _handleLogin() async {
    // Validation du formulaire
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      // Récupérer le provider SANS écouter les changements
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      
      // Appeler le service via le provider
      final success = await userProvider.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (mounted) {
        setState(() => _isLoading = false);
        
        if (success) {
          // Succès : navigation selon le rôle
          final user = userProvider.currentUser;
          if (user?.role == UserRole.learner) {
            Navigator.pushReplacementNamed(context, AppRoutes.learnerDashboard);
          } else {
            Navigator.pushReplacementNamed(context, AppRoutes.home);
          }
        } else {
          // Échec : afficher l'erreur
          _showErrorSnackbar('Email ou mot de passe incorrect');
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                // 3. Utilisation de widgets réutilisables
                CustomTextField(
                  controller: _emailController,
                  label: 'Email Address',
                  hint: 'your.email@example.com',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: Icons.email_rounded,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email';
                    }
                    if (!value.contains('@')) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 20),
                
                CustomTextField(
                  controller: _passwordController,
                  label: 'Password',
                  obscureText: _obscurePassword,
                  prefixIcon: Icons.lock_rounded,
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword 
                        ? Icons.visibility_rounded 
                        : Icons.visibility_off_rounded),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 24),
                
                // 4. Bouton avec état de chargement
                CustomButton(
                  text: 'Sign In',
                  onPressed: _handleLogin,
                  isLoading: _isLoading,
                  useGradient: true,
                  icon: Icons.arrow_forward_rounded,
                  width: double.infinity,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

### 💻 Implémentation - CustomButton (Widget Réutilisable)

```dart
class CustomButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final bool useGradient;
  final IconData? icon;
  final Color? backgroundColor;
  final double? width;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.useGradient = false,
    this.icon,
    this.backgroundColor,
    this.width,
  });

  @override
  State<CustomButton> createState() => _CustomButtonState();
}

class _CustomButtonState extends State<CustomButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    // Contenu du bouton (texte + icône ou loader)
    final buttonContent = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.isLoading)
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(
                widget.isOutlined ? AppTheme.primaryColor : Colors.white,
              ),
            ),
          )
        else ...[
          if (widget.icon != null) ...[
            Icon(widget.icon, size: 20, color: Colors.white),
            const SizedBox(width: 10),
          ],
          Text(
            widget.text,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 15,
              color: widget.isOutlined ? AppTheme.primaryColor : Colors.white,
            ),
          ),
        ],
      ],
    );

    // Bouton avec effet hover et animation
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: widget.width,
        transform: Matrix4.identity()..scale(_isHovered ? 1.02 : 1.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: widget.useGradient ? AppTheme.primaryGradient : null,
          color: widget.useGradient ? null : AppTheme.primaryColor,
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryColor.withOpacity(_isHovered ? 0.4 : 0.2),
              blurRadius: _isHovered ? 20 : 12,
              offset: Offset(0, _isHovered ? 8 : 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.isLoading ? null : widget.onPressed,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: buttonContent,
            ),
          ),
        ),
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: 0.2, end: 0);
  }
}
```

### 🔑 Points Clés
- **StatefulWidget** : Pour les écrans avec état local
- **Provider.of<T>(context, listen: false)** : Accès au provider sans rebuild
- **Validation** : Formulaires avec clés et validators
- **Réutilisabilité** : CustomButton, CustomTextField partagés
- **Animations** : flutter_animate pour les transitions

---

## 6. Gestion d'État (State Management)

### 📍 Emplacement : `lib/core/providers/`

### 🎯 Rôle
- Gérer l'état global de l'app
- Notifier les widgets des changements
- Centraliser la logique métier

### 💻 Implémentation - UserProvider

```dart
class UserProvider with ChangeNotifier {
  final AuthService authService;
  
  // État privé
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserProvider({required this.authService});

  // Getters publics
  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isAdmin => _currentUser?.role == UserRole.admin;
  bool get isTrainer => _currentUser?.role == UserRole.trainer;
  bool get isLearner => _currentUser?.role == UserRole.learner;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Login
  Future<bool> login(String email, String password) async {
    // 1. Activer le loading
    _isLoading = true;
    _errorMessage = null;
    notifyListeners(); // ← Rebuild des widgets écoutants

    try {
      // 2. Appeler le service
      final result = await authService.login(email, password);
      
      // 3. Pattern matching sur Result
      if (result is Success<UserModel>) {
        _currentUser = result.data;
        _isLoading = false;
        notifyListeners(); // ← Rebuild avec user connecté
        return true;
      } else if (result is Failure<UserModel>) {
        _errorMessage = result.message;
        _isLoading = false;
        notifyListeners(); // ← Rebuild avec erreur
        return false;
      }
      return false;
    } catch (e) {
      _errorMessage = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    await authService.logout();
    _currentUser = null;
    _errorMessage = null;
    notifyListeners(); // ← Rebuild UI déconnecté
  }

  // Update profil
  Future<void> updateProfile({
    String? name,
    String? formation,
    String? level,
    Map<String, dynamic>? preferences,
  }) async {
    if (_currentUser == null) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await authService.updateProfile(
        userId: _currentUser!.id,
        name: name,
        formation: formation,
        level: level,
        preferences: preferences,
      );
      
      if (result is Success<UserModel>) {
        _currentUser = result.data;
        _isLoading = false;
        notifyListeners();
      } else if (result is Failure<UserModel>) {
        _errorMessage = result.message;
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

### 🔑 Points Clés
- **ChangeNotifier** : Mixin pour notifier les changements
- **notifyListeners()** : Rebuild tous les widgets écoutants
- **État privé** : `_currentUser`, `_isLoading` (protected)
- **Getters publics** : Accès en lecture seule
- **Pattern Provider** : Séparation UI/Business Logic

---

## 7. Navigation & Routing

### 📍 Emplacement : `lib/core/routes/app_routes.dart`

### 🎯 Rôle
- Centraliser toutes les routes
- Gérer les transitions entre écrans
- Passer des arguments entre pages

### 💻 Implémentation

```dart
class AppRoutes {
  // Définition des routes
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String learnerDashboard = '/learner-dashboard';
  static const String chat = '/chat';

  // Générateur de routes
  static Route<dynamic> generateRoute(RouteSettings routeSettings) {
    switch (routeSettings.name) {
      case splash:
        return _buildRoute(const SplashScreen());
      
      case login:
        return _buildRoute(const LoginScreen());
      
      case register:
        return _buildRoute(const RegisterScreen());
      
      case learnerDashboard:
        return _buildRoute(const LearnerDashboard());
      
      case chat:
        // Récupérer les arguments
        final conversationId = routeSettings.arguments as String?;
        return _buildRoute(ChatScreen(conversationId: conversationId));
      
      default:
        return _buildRoute(
          Scaffold(
            body: Center(
              child: Text('Route ${routeSettings.name} not found'),
            ),
          ),
        );
    }
  }

  // Builder avec animations personnalisées
  static PageRoute<dynamic> _buildRoute(Widget screen) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => screen,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        // Animation de slide + fade
        const begin = Offset(1.0, 0.0); // De droite à gauche
        const end = Offset.zero;
        const curve = Curves.easeInOutCubic;

        var tween = Tween(begin: begin, end: end).chain(
          CurveTween(curve: curve),
        );

        return SlideTransition(
          position: animation.drive(tween),
          child: FadeTransition(
            opacity: animation,
            child: child,
          ),
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
}

// UTILISATION dans un widget :
// Navigation simple
Navigator.pushNamed(context, AppRoutes.login);

// Navigation avec remplacement (pas de retour arrière)
Navigator.pushReplacementNamed(context, AppRoutes.learnerDashboard);

// Navigation avec arguments
Navigator.pushNamed(
  context, 
  AppRoutes.chat, 
  arguments: conversationId,
);

// Retour arrière
Navigator.pop(context);
```

### 🔑 Points Clés
- **Centralisation** : Toutes les routes au même endroit
- **Type-safe** : Constantes pour éviter les erreurs de typo
- **Animations custom** : SlideTransition + FadeTransition
- **Arguments** : Passer des données entre écrans

---

## 8. Thème & Design System

### 📍 Emplacement : `lib/core/theme/`

### 🎯 Rôle
- Définir la palette de couleurs
- Configurer la typographie
- Standardiser les composants
- Support dark mode

### 💻 Implémentation

```dart
class AppTheme {
  // Palette de couleurs
  static const Color primaryColor = Color(0xFF01996D); // Vert Coursera
  static const Color secondaryColor = Color(0xFF007955); 
  static const Color accentColor = Color(0xFF4A90E2); // Bleu
  static const Color backgroundColor = Color(0xFFFAFAFA);
  static const Color surfaceColor = Color(0xFFFFFFFF);
  static const Color errorColor = Color(0xFFEF4444);
  static const Color textPrimary = Color(0xFF1F1F1F);
  static const Color textSecondary = Color(0xFF6B6B6B);
  
  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF01996D), Color(0xFF00B383)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Thème Light
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: backgroundColor,
      
      // Schéma de couleurs
      colorScheme: ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
        error: errorColor,
        surface: surfaceColor,
        onPrimary: Colors.white,
        onSurface: textPrimary,
      ),
      
      // Typographie avec Google Fonts
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: textPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: textPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          color: textSecondary,
        ),
      ),
      
      // AppBar
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: Colors.transparent,
        foregroundColor: textPrimary,
      ),
      
      // Boutons
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          foregroundColor: Colors.white,
          backgroundColor: primaryColor,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      
      // Champs de texte
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
      ),
      
      // Cards
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: borderColor.withOpacity(0.5)),
        ),
      ),
    );
  }

  // Thème Dark (même structure)
  static ThemeData get darkTheme {
    // ... configuration similaire avec couleurs sombres
  }
}

// UTILISATION :
// Dans main.dart
MaterialApp(
  theme: AppTheme.lightTheme,
  darkTheme: AppTheme.darkTheme,
  themeMode: ThemeMode.system, // Auto selon le système
);

// Dans un widget :
Text(
  'Hello',
  style: Theme.of(context).textTheme.displayLarge,
);

Container(
  color: Theme.of(context).colorScheme.primary,
);
```

---

## 9. Flux de Données Complet

### 📊 Exemple : Connexion Utilisateur

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION (Presentation Layer)                       │
│                                                                 │
│   LoginScreen                                                   │
│     ├─ User taps "Sign In" button                              │
│     └─ _handleLogin() appelé                                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. STATE MANAGEMENT (Presentation Layer)                       │
│                                                                 │
│   final userProvider = Provider.of<UserProvider>(              │
│     context,                                                    │
│     listen: false                                               │
│   );                                                            │
│   final success = await userProvider.login(email, password);   │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. PROVIDER (State Management)                                 │
│                                                                 │
│   UserProvider.login()                                          │
│     ├─ _isLoading = true                                       │
│     ├─ notifyListeners() ← UI montre le loader                 │
│     └─ final result = await authService.login(...)             │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. BUSINESS SERVICE (Data Layer)                               │
│                                                                 │
│   AuthService.login()                                           │
│     └─ final response = await apiService.post(...)             │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. API SERVICE (Data Layer)                                    │
│                                                                 │
│   ApiService.post('/api/auth/login', {...})                    │
│     ├─ Interceptor ajoute headers                              │
│     ├─ dio.post('http://localhost:8080/api/auth/login')        │
│     └─ Logger enregistre la requête                            │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. BACKEND (Spring Boot)                                       │
│                                                                 │
│   POST /api/auth/login                                          │
│   AuthController.login()                                        │
│     ├─ Valider credentials (BCrypt)                            │
│     ├─ Générer JWT tokens                                      │
│     └─ return {user, accessToken, refreshToken}                │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. DATABASE (PostgreSQL)                                       │
│                                                                 │
│   SELECT * FROM users WHERE email = ?                           │
│   Retourne: User entity                                         │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. RESPONSE PROCESSING (Data Layer)                            │
│                                                                 │
│   ApiService reçoit la response                                 │
│     ├─ Interceptor log la response                             │
│     └─ return response.data                                     │
│                                                                 │
│   AuthService traite la response                                │
│     ├─ final user = UserModel.fromJson(response['user'])       │
│     ├─ await storage.saveAccessToken(accessToken)              │
│     ├─ await storage.saveUser(user)                            │
│     └─ return Success(user)                                     │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. STATE UPDATE (State Management)                             │
│                                                                 │
│   UserProvider reçoit Success(user)                             │
│     ├─ _currentUser = user                                     │
│     ├─ _isLoading = false                                      │
│     └─ notifyListeners() ← UI se rebuild automatiquement       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. UI UPDATE (Presentation Layer)                             │
│                                                                 │
│   LoginScreen                                                   │
│     ├─ success == true                                          │
│     ├─ Navigator.pushReplacementNamed(                         │
│     │     context,                                              │
│     │     AppRoutes.learnerDashboard                           │
│     │   )                                                       │
│     └─ User voit le dashboard 🎉                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Résumé des Concepts Clés

### ✅ Architecture
- **3 Couches** : Presentation, Domain, Data
- **Separation of Concerns** : Chaque couche a un rôle précis
- **Dependency Rule** : Data ← Domain ← Presentation

### ✅ Patterns Utilisés
- **Dependency Injection** : GetIt pour singleton services
- **Repository Pattern** : Services = repositories
- **Result Pattern** : Type-safe error handling
- **Provider Pattern** : State management
- **Factory Pattern** : fromJson constructors

### ✅ Principes SOLID
- **S**ingle Responsibility : Chaque classe un seul rôle
- **O**pen/Closed : Extensions via inheritance
- **L**iskov Substitution : Result<T> polymorphisme
- **I**nterface Segregation : Services spécialisés
- **D**ependency Inversion : Dépend d'abstractions

### ✅ Avantages
- **Testabilité** : Mock facile des services
- **Maintenabilité** : Code organisé et clair
- **Scalabilité** : Ajout de features facile
- **Réutilisabilité** : Widgets et services partagés

---

**Document généré pour l'examen PFA 2025** 🎓
