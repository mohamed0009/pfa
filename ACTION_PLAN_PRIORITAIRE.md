# 🎯 PLAN D'ACTION PRIORITAIRE
## Corrections et améliorations à apporter au projet PFA

**Date**: 30 Novembre 2025  
**Basé sur**: RAPPORT_EXAMEN_PROJET.md

---

## 🚨 URGENT - À FAIRE CETTE SEMAINE

### 1. 🔐 SÉCURITÉ: Hachage des mots de passe
**Priorité**: 🔴 CRITIQUE  
**Temps estimé**: 2-3 heures  
**Impact**: Bloquant pour production

#### Étapes:
```bash
# 1. Ajouter la dépendance bcrypt
flutter pub add bcrypt
```

```dart
// 2. Créer un utilitaire de hashage
// lib/core/utils/password_util.dart

import 'package:bcrypt/bcrypt.dart';

class PasswordUtil {
  /// Hash un mot de passe
  static String hashPassword(String password) {
    return BCrypt.hashpw(password, BCrypt.gensalt());
  }
  
  /// Vérifie un mot de passe contre un hash
  static bool verifyPassword(String password, String hashedPassword) {
    return BCrypt.checkpw(password, hashedPassword);
  }
}
```

```dart
// 3. Modifier AuthService
// lib/core/services/auth_service.dart

import '../utils/password_util.dart';

class AuthService {
  // Lors de l'inscription
  Future<Result<UserModel>> register({
    required String email,
    required String name,
    required String password,
    required UserRole role,
    String? formation,
    String? level,
  }) async {
    // Hash le mot de passe AVANT de sauvegarder
    final hashedPassword = PasswordUtil.hashPassword(password);
    
    final user = UserModel(
      id: uuid.v4(),
      email: email,
      name: name,
      hashedPassword: hashedPassword,  // Sauvegarder le hash
      role: role,
      // ...
    );
    // ...
  }

  // Lors de la connexion
  Future<Result<UserModel>> login({
    required String email,
    required String password,
  }) async {
    final users = await _getAllUsers();
    final user = users.firstWhere(
      (u) => u.email.toLowerCase() == email.toLowerCase(),
      orElse: () => throw Exception('User not found'),
    );
    
    // Vérifier avec bcrypt
    if (!PasswordUtil.verifyPassword(password, user.hashedPassword)) {
      return Result.error('Invalid credentials');
    }
    
    // Login réussi
    return Result.success(user);
  }
}
```

```dart
// 4. Modifier UserModel pour inclure hashedPassword
// lib/core/models/user_model.dart

class UserModel {
  final String id;
  final String email;
  final String name;
  final String hashedPassword;  // Nouveau champ
  // ... autres champs
  
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      hashedPassword: json['hashedPassword'] as String,
      // ...
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'hashedPassword': hashedPassword,  // Sauvegarder le hash
      // ...
    };
  }
}
```

#### Vérification:
- [ ] Package bcrypt ajouté
- [ ] PasswordUtil créé
- [ ] AuthService modifié
- [ ] UserModel mis à jour
- [ ] Tests manuels effectués
- [ ] Documentation mise à jour

---

### 2. 📄 Configuration .env
**Priorité**: 🟠 Important  
**Temps estimé**: 5 minutes  
**Impact**: Configuration production

#### Étapes:
```bash
# 1. Copier le template
cp .env.example .env

# 2. Éditer .env avec vos vraies valeurs
# Utiliser un éditeur de texte
```

```env
# .env - EXEMPLE (NE PAS COMMITER!)

# API Configuration
API_BASE_URL=http://localhost:8000
API_TIMEOUT=30000

# OpenAI (optionnel, pour coach IA avancé)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4

# Ollama (alternative locale)
# Démarrer Ollama avec: ollama serve

# Firebase (optionnel)
FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_APP_ID=

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
ENABLE_PUSH_NOTIFICATIONS=false

# Environment
ENV=development
DEBUG_MODE=true
```

#### Vérification:
- [ ] Fichier .env créé
- [ ] Valeurs remplies
- [ ] .env dans .gitignore
- [ ] Application testée avec vraies configs

---

## 📅 DANS LES 2 PROCHAINES SEMAINES

### 3. 🧪 Tests unitaires
**Priorité**: 🟠 Haute  
**Temps estimé**: 1-2 jours  
**Objectif**: 50% de couverture

#### Créer ces fichiers de tests:

```dart
// test/core/services/auth_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:pfa/core/services/auth_service.dart';
import 'package:pfa/core/utils/password_util.dart';

void main() {
  group('AuthService Tests', () {
    late AuthService authService;
    
    setUp(() {
      authService = AuthService();
    });
    
    test('register should hash password', () async {
      final result = await authService.register(
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.learner,
      );
      
      expect(result.isSuccess, true);
      final user = result.data!;
      expect(user.hashedPassword, isNot('password123'));
      expect(user.hashedPassword.length, greaterThan(50));
    });
    
    test('login should verify hashed password', () async {
      // D'abord s'inscrire
      await authService.register(
        email: 'test@example.com',
        name: 'Test',
        password: 'password123',
        role: UserRole.learner,
      );
      
      // Puis se connecter
      final result = await authService.login(
        email: 'test@example.com',
        password: 'password123',
      );
      
      expect(result.isSuccess, true);
    });
    
    test('login should fail with wrong password', () async {
      await authService.register(
        email: 'test@example.com',
        name: 'Test',
        password: 'password123',
        role: UserRole.learner,
      );
      
      final result = await authService.login(
        email: 'test@example.com',
        password: 'wrongpassword',
      );
      
      expect(result.isSuccess, false);
    });
  });
}
```

```dart
// test/core/providers/user_provider_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:pfa/core/providers/user_provider.dart';

void main() {
  group('UserProvider Tests', () {
    late UserProvider userProvider;
    
    setUp(() {
      userProvider = UserProvider();
    });
    
    test('initial state should be unauthenticated', () {
      expect(userProvider.isAuthenticated, false);
      expect(userProvider.currentUser, isNull);
    });
    
    test('login should update user state', () async {
      await userProvider.login(
        email: 'test@example.com',
        password: 'password123',
      );
      
      expect(userProvider.isAuthenticated, true);
      expect(userProvider.currentUser, isNotNull);
    });
    
    test('logout should clear user state', () async {
      await userProvider.login(
        email: 'test@example.com',
        password: 'password123',
      );
      
      await userProvider.logout();
      
      expect(userProvider.isAuthenticated, false);
      expect(userProvider.currentUser, isNull);
    });
  });
}
```

```dart
// test/core/services/ai_coach_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:pfa/core/services/ai_coach_service.dart';

void main() {
  group('AICoachService Tests', () {
    late AICoachService aiCoachService;
    
    setUp(() {
      aiCoachService = AICoachService();
    });
    
    test('generateResponse should return non-empty response', () async {
      final response = await aiCoachService.generateResponse(
        'Explain variables in programming',
      );
      
      expect(response, isNotEmpty);
      expect(response.length, greaterThan(10));
    });
    
    test('generateQuiz should return quiz data', () async {
      final quiz = await aiCoachService.generateQuiz(
        topics: ['variables', 'functions'],
        difficulty: 2,
      );
      
      expect(quiz, isNotEmpty);
    });
  });
}
```

#### Commandes utiles:
```bash
# Lancer tous les tests
flutter test

# Lancer tests avec couverture
flutter test --coverage

# Voir le rapport de couverture
genhtml coverage/lcov.info -o coverage/html
# Ouvrir coverage/html/index.html
```

#### Checklist:
- [ ] Tests AuthService créés
- [ ] Tests UserProvider créés
- [ ] Tests AICoachService créés
- [ ] Tests LearningService créés
- [ ] Tous les tests passent
- [ ] Couverture ≥ 50%

---

### 4. 🔌 Intégration API Backend
**Priorité**: 🟠 Haute  
**Temps estimé**: 4-6 heures

#### Démarrer le backend:
```bash
# Terminal 1: API FastAPI
cd pfa
python serve_model.py
# API disponible sur http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

```bash
# Terminal 2 (optionnel): Ollama
ollama pull qwen2.5:0.5b
ollama serve
```

#### Modifier AICoachService pour utiliser l'API réelle:
```dart
// lib/core/services/ai_coach_service.dart

class AICoachService {
  final ApiService _apiService;
  final String _baseUrl = 'http://localhost:8000';  // Ou depuis .env
  
  Future<String> generateResponse(
    String message, {
    String? context,
  }) async {
    try {
      // Appeler l'endpoint hybride (ML + Ollama)
      final response = await _apiService.post<Map<String, dynamic>>(
        '$_baseUrl/coach/hybrid',
        data: {
          'question': message,
          'answer': context ?? '',
          'subject': 'general',
          'topic': 'learning',
        },
      );
      
      if (response.isSuccess) {
        return response.data!['response'] as String;
      } else {
        return 'Je rencontre des difficultés. Réessayons plus tard.';
      }
    } catch (e) {
      logger.error('AI Coach error: $e');
      return _generateFallbackResponse(message);
    }
  }
  
  String _generateFallbackResponse(String message) {
    // Réponse de secours si API indisponible
    return 'Je suis là pour vous aider. Que voulez-vous apprendre?';
  }
}
```

#### Tester l'intégration:
```bash
# 1. S'assurer que l'API tourne
curl http://localhost:8000/health

# 2. Tester une prédiction
curl -X POST http://localhost:8000/coach/predict \
  -H "Content-Type: application/json" \
  -d '{"question": "Explain Python lists", "answer": ""}'

# 3. Tester l'endpoint hybride
curl -X POST http://localhost:8000/coach/hybrid \
  -H "Content-Type: application/json" \
  -d '{"question": "What are variables?"}'
```

#### Checklist:
- [ ] API backend démarrée
- [ ] Ollama configuré (optionnel)
- [ ] AICoachService modifié
- [ ] .env configuré avec API_BASE_URL
- [ ] Tests manuels réussis
- [ ] Gestion d'erreurs testée

---

## 📆 DANS LE MOIS

### 5. 🎨 Améliorations Code Quality
**Priorité**: 🟡 Moyenne  
**Temps estimé**: 1 jour

#### Créer fichier de constantes:
```dart
// lib/core/constants/app_constants.dart

class AppConstants {
  // URLs
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8000',
  );
  
  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration shortTimeout = Duration(seconds: 5);
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const int minNameLength = 2;
  
  // Storage Keys
  static const String userKey = 'user_data';
  static const String tokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  
  // Routes
  static const String loginRoute = '/login';
  static const String registerRoute = '/register';
  static const String dashboardRoute = '/dashboard';
  static const String chatRoute = '/chat';
}
```

```dart
// lib/core/constants/string_constants.dart

class StringConstants {
  // Errors
  static const String networkError = 'Erreur de connexion réseau';
  static const String serverError = 'Erreur serveur. Réessayez plus tard.';
  static const String invalidCredentials = 'Email ou mot de passe incorrect';
  static const String emailAlreadyExists = 'Cet email existe déjà';
  
  // Success
  static const String loginSuccess = 'Connexion réussie!';
  static const String registerSuccess = 'Inscription réussie!';
  static const String profileUpdated = 'Profil mis à jour';
  
  // Validation
  static const String emailRequired = 'Email requis';
  static const String emailInvalid = 'Email invalide';
  static const String passwordRequired = 'Mot de passe requis';
  static const String passwordTooShort = 'Mot de passe trop court (min 8 caractères)';
}
```

#### Checklist:
- [ ] Constantes créées
- [ ] Magic numbers remplacés
- [ ] Chaînes centralisées
- [ ] Imports organisés
- [ ] Code formatting (dart format .)
- [ ] Lints corrigés (flutter analyze)

---

### 6. ⚙️ CI/CD Pipeline
**Priorité**: 🟡 Moyenne  
**Temps estimé**: 1 jour

#### Créer workflow GitHub Actions:
```yaml
# .github/workflows/flutter.yml
name: Flutter CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.16.0'
        
    - name: Install dependencies
      run: flutter pub get
      
    - name: Verify formatting
      run: dart format --output=none --set-exit-if-changed .
      
    - name: Analyze code
      run: flutter analyze
      
    - name: Run tests
      run: flutter test --coverage
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      
    - name: Build APK
      run: flutter build apk --release
      
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-release.apk
        path: build/app/outputs/flutter-apk/app-release.apk
```

```yaml
# .github/workflows/python.yml
name: Python ML API

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.13'
        
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest pytest-cov
        
    - name: Run tests
      run: pytest --cov=. --cov-report=xml
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

#### Checklist:
- [ ] GitHub Actions configuré
- [ ] Tests automatiques sur push
- [ ] Build automatique
- [ ] Code coverage tracking
- [ ] Badge status ajouté au README

---

## 📊 SUIVI DE PROGRESSION

### Semaine 1
- [ ] ✅ Sécurité mots de passe (CRITIQUE)
- [ ] ✅ Configuration .env
- [ ] Tests manuels de l'app
- [ ] Documentation mise à jour

### Semaine 2
- [ ] Tests unitaires ≥ 50%
- [ ] Intégration API backend
- [ ] Tests d'intégration
- [ ] Préparation CI/CD

### Semaine 3
- [ ] Code quality improvements
- [ ] CI/CD activé
- [ ] Documentation contributeur
- [ ] Performance profiling

### Semaine 4
- [ ] Review complète
- [ ] Tests E2E
- [ ] Préparation déploiement
- [ ] Guide utilisateur

---

## 🎯 OBJECTIFS MESURABLES

### Sécurité
- [ ] 0 mots de passe en clair
- [ ] Toutes les entrées validées
- [ ] HTTPS uniquement en production
- [ ] Secrets dans variables d'environnement

### Tests
- [ ] Couverture ≥ 80%
- [ ] 0 tests échouant
- [ ] Tests intégration pour flows critiques
- [ ] CI vert sur main

### Performance
- [ ] Temps démarrage < 2s
- [ ] RAM utilisée < 150 MB
- [ ] 0 rebuilds inutiles
- [ ] Images optimisées

### Documentation
- [ ] README à jour
- [ ] Guide contributeur
- [ ] Changelog maintenu
- [ ] API documentée (Swagger)

---

## 📞 RESSOURCES

### Liens utiles
- **Bcrypt Flutter**: https://pub.dev/packages/bcrypt
- **Flutter Testing**: https://docs.flutter.dev/testing
- **GitHub Actions Flutter**: https://github.com/marketplace/actions/flutter-action
- **FastAPI Docs**: https://fastapi.tiangolo.com

### Commandes rapides
```bash
# Tests
flutter test --coverage
flutter analyze

# Build
flutter build apk --release
flutter build web --release

# Clean
flutter clean
flutter pub get

# API Backend
python serve_model.py
curl http://localhost:8000/docs
```

---

**Document créé**: 30 Novembre 2025  
**Mise à jour**: À chaque sprint  
**Responsable**: Équipe PFA

**Bon courage! 💪🚀**
