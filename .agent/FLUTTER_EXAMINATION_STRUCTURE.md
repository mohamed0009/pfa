# Flutter Application Structure & Architecture - Complete Examination Guide

## 📱 **PROJECT OVERVIEW**

**Project Name:** Coach AI - PFA (Projet de Fin d'Année)  
**Type:** Mobile Learning Platform (Flutter)  
**Description:** Professional Flutter application for AI-assisted learning with multi-role support (Learners, Trainers, Admins)

---

## 🏗️ **ARCHITECTURE LAYERS**

The application follows **Clean Architecture** principles with a feature-based folder structure:

### **1. Presentation Layer** (`lib/features/*/presentation/`)
- **Responsibility:** UI components and user interactions
- **Contains:** Screens, widgets, UI state management
- **Key Features:**
  - Responsive design across mobile/tablet/desktop
  - Modern Material Design 3
  - Smooth animations and transitions
  - Provider state management

### **2. Domain Layer** (`lib/core/models/`)
- **Responsibility:** Business logic and data entities
- **Contains:** Domain models, business rules
- **Key Features:**
  - Immutable data models
  - JSON serialization/deserialization
  - Type-safe enumerations
  - Data validation

### **3. Data Layer** (`lib/core/services/`)
- **Responsibility:** Data access and external integrations
- **Contains:** API clients, storage, repositories
- **Key Features:**
  - RESTful API integration (Dio HTTP client)
  - Secure local storage (FlutterSecureStorage)
  - Caching mechanisms
  - Error handling and retry logic

---

## 📂 **PROJECT STRUCTURE**

```
pfa/
├── lib/
│   ├── core/                          # Core application infrastructure
│   │   ├── config/                    # App configuration (env, constants)
│   │   │   └── app_config.dart        # Environment variables, API URLs
│   │   ├── di/                        # Dependency injection (GetIt)
│   │   │   └── dependency_injection.dart
│   │   ├── errors/                    # Error handling
│   │   │   ├── app_exception.dart     # Custom exceptions
│   │   │   └── result.dart            # Result pattern implementation
│   │   ├── models/                    # Domain models (8 models)
│   │   │   ├── user_model.dart        # User entity
│   │   │   ├── chat_message.dart      # Chat message model
│   │   │   ├── conversation_model.dart # Conversation model
│   │   │   ├── learning_module.dart   # Learning module
│   │   │   ├── progress_model.dart    # User progress tracking
│   │   │   ├── quiz_model.dart        # Quiz/assessment model
│   │   │   ├── trainer_models.dart    # Trainer-related models
│   │   │   └── coach_recommendation.dart # AI recommendations
│   │   ├── providers/                 # State management (Provider)
│   │   │   └── user_provider.dart     # Global user state
│   │   ├── routes/                    # Navigation (GoRouter)
│   │   │   └── app_router.dart        # Route configuration
│   │   ├── services/                  # Core services (9 services)
│   │   │   ├── api_service.dart       # HTTP client (Dio)
│   │   │   ├── auth_service.dart      # Authentication
│   │   │   ├── storage_service.dart   # Local/secure storage
│   │   │   ├── logger_service.dart    # Logging
│   │   │   ├── ai_coach_service.dart  # AI chat integration
│   │   │   ├── learning_service.dart  # Learning modules API
│   │   │   ├── conversation_service.dart # Chat sessions
│   │   │   ├── audio_service.dart     # Voice recording/playback
│   │   │   └── trainer_service.dart   # Trainer features
│   │   ├── theme/                     # Design system
│   │   │   ├── app_theme.dart         # Theme configuration
│   │   │   ├── app_colors.dart        # Color palette
│   │   │   └── app_dimensions.dart    # Spacing, sizing
│   │   └── utils/                     # Utilities
│   │       └── responsive.dart        # Responsive helpers
│   │
│   ├── features/                      # Feature modules (10 features)
│   │   ├── auth/                      # Authentication
│   │   │   ├── presentation/
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── register_screen.dart
│   │   │   │   └── forgot_password_screen.dart
│   │   │   └── widgets/               # Auth-specific widgets
│   │   │
│   │   ├── onboarding/                # First-time user experience
│   │   │   └── presentation/
│   │   │       └── onboarding_screen.dart
│   │   │
│   │   ├── splash/                    # Splash screen
│   │   │   └── presentation/
│   │   │       └── splash_screen.dart
│   │   │
│   │   ├── dashboard/                 # Role-based dashboards
│   │   │   ├── presentation/
│   │   │   │   ├── learner_dashboard.dart    # Student home
│   │   │   │   ├── trainer_dashboard.dart    # Trainer home
│   │   │   │   └── admin_dashboard.dart      # Admin home
│   │   │   ├── models/
│   │   │   │   └── dashboard_stats.dart
│   │   │   └── services/
│   │   │       └── dashboard_service.dart
│   │   │
│   │   ├── chat/                      # AI Chat interface
│   │   │   └── presentation/
│   │   │       ├── chat_screen.dart           # Main chat UI
│   │   │       └── conversation_list_screen.dart # Chat history
│   │   │
│   │   ├── learning/                  # Learning modules
│   │   │   └── presentation/
│   │   │       ├── learning_modules_screen.dart # Module catalog
│   │   │       ├── module_detail_screen.dart    # Module content
│   │   │       ├── quiz_screen.dart             # Quizzes
│   │   │       └── exercise_screen.dart         # Exercises
│   │   │
│   │   ├── profile/                   # User profile
│   │   │   └── presentation/
│   │   │       └── profile_screen.dart
│   │   │
│   │   ├── settings/                  # App settings
│   │   │   └── presentation/
│   │   │       └── settings_screen.dart
│   │   │
│   │   ├── home/                      # Home screen
│   │   │   └── presentation/
│   │   │       └── home_screen.dart
│   │   │
│   │   └── admin/                     # Admin features
│   │       ├── screens/
│   │       │   ├── ai_supervision/    # AI monitoring
│   │       │   │   └── ai_supervision_screen.dart
│   │       │   ├── user_management/   # User admin
│   │       │   ├── content_management/ # Content admin
│   │       │   ├── trainer_management/ # Trainer admin
│   │       │   └── analytics/         # Analytics
│   │       ├── models/
│   │       │   └── admin_models.dart
│   │       └── services/
│   │           └── ai_supervision_service.dart
│   │
│   ├── widgets/                       # Reusable widgets (7 widgets)
│   │   ├── custom_button.dart         # Primary button
│   │   ├── custom_card.dart           # Card component
│   │   ├── custom_text_field.dart     # Input field
│   │   ├── stat_card.dart             # Statistics card
│   │   ├── module_card.dart           # Learning module card
│   │   ├── progress_bar.dart          # Progress indicator
│   │   └── loading_overlay.dart       # Loading state
│   │
│   └── main.dart                      # App entry point
│
├── assets/                            # Static assets
│   ├── images/                        # Images
│   ├── icons/                         # Icons
│   └── animations/                    # Lottie animations
│
├── backend/                           # Spring Boot backend
│   └── src/main/java/com/coachai/
│       ├── model/                     # JPA entities
│       ├── controller/                # REST controllers
│       ├── service/                   # Business logic
│       ├── repository/                # Data access
│       └── config/                    # Configuration
│
├── .env                               # Environment variables
├── pubspec.yaml                       # Dependencies
└── ARCHITECTURE.md                    # Architecture docs
```

---

## 🎨 **PRESENTATION LAYER - WIDGETS & SCREENS**

### **Main Screens (10 Features)**

#### 1. **Authentication** (`features/auth/`)
- **Login Screen:** Email/password authentication
- **Register Screen:** New user registration
- **Forgot Password:** Password recovery

#### 2. **Onboarding** (`features/onboarding/`)
- **Onboarding Screen:** Welcome carousel for new users

#### 3. **Splash** (`features/splash/`)
- **Splash Screen:** App initialization screen

#### 4. **Dashboard** (`features/dashboard/`)
- **Learner Dashboard:** 
  - Progress overview
  - Recommended courses
  - Recent activities
  - Quick actions
- **Trainer Dashboard:**
  - Student statistics
  - Content management
  - Validation queue
- **Admin Dashboard:**
  - System analytics
  - User management
  - AI supervision

#### 5. **Chat** (`features/chat/`)
- **Chat Screen:** AI conversation interface
  - Text/voice input
  - Message history
  - File attachments
  - Real-time responses
- **Conversation List:** Chat history management

#### 6. **Learning** (`features/learning/`)
- **Learning Modules:** Browse courses/modules
- **Module Detail:** Course content viewer
- **Quiz Screen:** Interactive assessments
- **Exercise Screen:** Practice activities

#### 7. **Profile** (`features/profile/`)
- **Profile Screen:** User information and settings

#### 8. **Settings** (`features/settings/`)
- **Settings Screen:** App preferences

#### 9. **Admin** (`features/admin/`)
- **AI Supervision:** Monitor AI interactions
- **User Management:** Manage users
- **Content Management:** Approve/reject content
- **Trainer Management:** Trainer oversight
- **Analytics:** System metrics

### **Reusable Widgets** (`widgets/`)
1. **CustomButton:** Primary action button with loading state
2. **CustomCard:** Card container with elevation
3. **CustomTextField:** Validated input field
4. **StatCard:** Dashboard statistics card
5. **ModuleCard:** Learning module preview card
6. **ProgressBar:** Circular/linear progress indicator
7. **LoadingOverlay:** Full-screen loading indicator

---

## 🔧 **CORE SERVICES - DATA LAYER**

### **1. API Service** (`api_service.dart`)
**Purpose:** Centralized HTTP client for backend communication

**Features:**
- Dio-based HTTP client
- JWT token management
- Request/response interceptors
- Automatic retry on failure
- Error handling and logging

**Methods:**
```dart
Future<T> get<T>(String endpoint, {...})
Future<T> post<T>(String endpoint, {dynamic data, ...})
Future<T> put<T>(String endpoint, {dynamic data, ...})
Future<T> delete<T>(String endpoint, {...})
Future<T> uploadFile<T>(String endpoint, String filePath, {...})
```

**Backend Integration:**
- Base URL: `http://localhost:8080/api`
- Authentication: Bearer token in headers
- Content-Type: application/json

### **2. Authentication Service** (`auth_service.dart`)
**Purpose:** User authentication and session management

**Features:**
- Login/logout
- Registration
- Token storage (secure)
- Session persistence
- Auto-login on app start

**Backend Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`

### **3. Storage Service** (`storage_service.dart`)
**Purpose:** Local data persistence

**Features:**
- Secure storage (tokens, credentials)
- SharedPreferences (user settings)
- Key-value storage

### **4. Learning Service** (`learning_service.dart`)
**Purpose:** Learning content management

**Features:**
- Fetch modules/courses
- Track progress
- Submit quizzes/exercises
- Get recommendations

**Backend Endpoints:**
- `GET /api/user/courses`
- `GET /api/user/progress`
- `POST /api/user/progress/update`

### **5. Conversation Service** (`conversation_service.dart`)
**Purpose:** Chat session management

**Features:**
- Create conversations
- Fetch chat history
- Send/receive messages
- Delete conversations

**Backend Endpoints:**
- `GET /api/user/chat/conversations`
- `POST /api/user/chat/conversations`
- `POST /api/user/chat/conversations/{id}/messages`
- `DELETE /api/user/chat/conversations/{id}`

### **6. AI Coach Service** (`ai_coach_service.dart`)
**Purpose:** AI-powered chat interactions

**Features:**
- Real-time chat responses
- Context-aware recommendations
- Learning path suggestions

### **7. Audio Service** (`audio_service.dart`)
**Purpose:** Voice input/output

**Features:**
- Speech-to-text
- Text-to-speech
- Audio recording
- Audio playback

### **8. Trainer Service** (`trainer_service.dart`)
**Purpose:** Trainer-specific features

**Features:**
- Student management
- Content creation
- Validation workflows

### **9. Logger Service** (`logger_service.dart`)
**Purpose:** Application logging

**Features:**
- Debug logs
- Error tracking
- Analytics events

---

## 📊 **DATA MODELS - DOMAIN LAYER**

### **1. User Model** (`user_model.dart`)
```dart
class UserModel {
  final String id;
  final String email;
  final String name;
  final String? formation;
  final String? level;
  final UserRole role; // admin, trainer, learner
  final Map<String, dynamic> preferences;
  final DateTime createdAt;
  final DateTime? lastLogin;
}

enum UserRole { admin, trainer, learner }
```

### **2. Chat Message** (`chat_message.dart`)
```dart
class ChatMessage {
  final String id;
  final String conversationId;
  final String content;
  final bool isUser;
  final DateTime timestamp;
  final List<String>? attachments;
}
```

### **3. Conversation Model** (`conversation_model.dart`)
```dart
class Conversation {
  final String id;
  final String userId;
  final String title;
  final List<ChatMessage> messages;
  final DateTime createdAt;
  final DateTime? updatedAt;
}
```

### **4. Learning Module** (`learning_module.dart`)
```dart
class LearningModule {
  final String id;
  final String title;
  final String description;
  final String category;
  final String level;
  final int duration;
  final double progress;
  final List<String> skills;
}
```

### **5. Progress Model** (`progress_model.dart`)
```dart
class ProgressModel {
  final String userId;
  final String moduleId;
  final double completionPercentage;
  final int timeSpent;
  final DateTime lastAccessed;
  final Map<String, dynamic> metrics;
}
```

### **6. Quiz Model** (`quiz_model.dart`)
```dart
class QuizModel {
  final String id;
  final String moduleId;
  final String title;
  final List<QuizQuestion> questions;
  final int totalPoints;
  final int passingScore;
}
```

### **7. Trainer Models** (`trainer_models.dart`)
Multiple trainer-specific models for content management

### **8. Coach Recommendation** (`coach_recommendation.dart`)
AI-generated learning recommendations

---

## 🗄️ **BACKEND DATABASE MODELS (JPA Entities)**

### **Technology Stack:**
- **Framework:** Spring Boot 3.2.0
- **Database:** PostgreSQL
- **ORM:** JPA/Hibernate
- **Language:** Java 17

### **Main Entities (27 models):**

#### 1. **User Entity**
```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String email;
    private String password; // BCrypt encrypted
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String phone;
    private String bio;
    private LocalDateTime validatedAt;
    
    @Enumerated(EnumType.STRING)
    private UserRole role; // ADMIN, TRAINER, USER
    
    @Enumerated(EnumType.STRING)
    private UserStatus status; // ACTIVE, INACTIVE, PENDING, SUSPENDED
    
    private String formation;
    
    @Enumerated(EnumType.STRING)
    private Level niveau; // DEBUTANT, INTERMEDIAIRE, AVANCE
    
    @OneToOne(cascade = CascadeType.ALL)
    private LearningPreferences preferences;
    
    @OneToMany(mappedBy = "user")
    private List<Enrollment> enrollments;
    
    @OneToMany(mappedBy = "user")
    private List<Conversation> conversations;
    
    private LocalDateTime joinedAt;
    private LocalDateTime lastActive;
}
```

#### 2. **Course Entity**
```java
@Entity
@Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String title;
    private String subtitle;
    private String description;
    private String longDescription;
    
    private String instructorName;
    private String instructorTitle;
    private String instructorAvatar;
    
    private String thumbnailUrl;
    private String previewVideoUrl;
    private String category;
    
    @Enumerated(EnumType.STRING)
    private Level level;
    
    private String language;
    private String duration;
    private double estimatedHours;
    private double rating;
    private int reviewsCount;
    private int enrolledCount;
    private double price;
    
    @ElementCollection
    private List<String> skills;
    
    @ElementCollection
    private List<String> learningObjectives;
    
    @ElementCollection
    private List<String> prerequisites;
    
    @ManyToOne
    @JoinColumn(name = "module_id")
    private Module module;
    
    @OneToMany(mappedBy = "course")
    private List<Lesson> lessons;
    
    @OneToMany(mappedBy = "course")
    private List<CourseResource> resources;
    
    @OneToMany(mappedBy = "course")
    private List<Exercise> exercises;
    
    @OneToMany(mappedBy = "course")
    private List<Quiz> quizzes;
    
    @Enumerated(EnumType.STRING)
    private ContentStatus status; // DRAFT, PUBLISHED, ARCHIVED
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime validatedAt;
}
```

#### 3. **Other Key Entities:**

**Learning Structure:**
- `Formation` - Learning programs
- `Module` - Course modules
- `Lesson` - Individual lessons
- `LessonResource` - Lesson materials
- `CourseResource` - Course materials
- `CourseProgress` - User course progress
- `ModuleProgress` - User module progress

**Assessments:**
- `Quiz` - Quizzes
- `QuizQuestion` - Quiz questions
- `QuizOption` - Multiple choice options
- `QuizAnswer` - User answers
- `QuizAttempt` - Quiz attempts
- `Exercise` - Practice exercises
- `ExerciseSubmission` - Exercise submissions

**Chat/AI:**
- `Conversation` - Chat sessions
- `ChatMessage` - Chat messages
- `ChatAttachment` - Message attachments
- `AICoachSession` - AI coaching sessions
- `AICoachMessage` - AI messages

**User Management:**
- `Enrollment` - Course enrollments
- `LearningPreferences` - User preferences
- `UserNotification` - Notifications
- `SupportTicket` - Support tickets
- `TicketMessage` - Ticket messages

**Enumerations:**
- `ContentStatus` - DRAFT, PUBLISHED, ARCHIVED
- `UserRole` - ADMIN, TRAINER, USER
- `UserStatus` - ACTIVE, INACTIVE, PENDING, SUSPENDED
- `Level` - DEBUTANT, INTERMEDIAIRE, AVANCE

---

## 🔌 **BACKEND API ENDPOINTS**

### **Authentication** (`AuthController`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Token refresh

### **User Endpoints** (`user/*`)
- **Profile:** `GET/PUT /api/user/profile`
- **Courses:** `GET /api/user/courses`
- **Progress:** `GET/POST /api/user/progress`
- **Quizzes:** `GET/POST /api/user/quizzes`
- **Exercises:** `GET/POST /api/user/exercises`
- **Enrollment:** `POST /api/user/enroll`
- **Notifications:** `GET /api/user/notifications`
- **Certificates:** `GET /api/user/certificates`
- **Support:** `POST /api/user/support`

### **Chat** (`ChatController`)
- `GET /api/user/chat/conversations` - List conversations
- `POST /api/user/chat/conversations` - Create conversation
- `GET /api/user/chat/conversations/{id}` - Get conversation
- `POST /api/user/chat/conversations/{id}/messages` - Send message
- `DELETE /api/user/chat/conversations/{id}` - Delete conversation

### **Trainer Endpoints** (`trainer/*`)
- **Courses:** `GET/POST/PUT /api/trainer/courses`
- **Modules:** `GET/POST/PUT /api/trainer/modules`
- **Formations:** `GET/POST/PUT /api/trainer/formations`
- **Exercises:** `GET/POST/PUT /api/trainer/exercises`
- **Quizzes:** `GET/POST/PUT /api/trainer/quizzes`
- **Students:** `GET /api/trainer/students`
- **Stats:** `GET /api/trainer/stats`
- **Reviews:** `GET /api/trainer/reviews`
- **Validation:** `POST /api/trainer/validation`
- **Messages:** `GET/POST /api/trainer/messages`

### **Admin Endpoints** (`admin/*`)
- **Users:** `GET/PUT/DELETE /api/admin/users`
- **Content:** `GET/PUT/DELETE /api/admin/content`
- **Trainers:** `GET/PUT/DELETE /api/admin/trainers`
- **AI:** `GET /api/admin/ai/*` (supervision, config, interactions)

---

## 🔐 **SECURITY & AUTHENTICATION**

### **Authentication Flow:**
1. User enters credentials
2. Frontend sends POST to `/api/auth/login`
3. Backend validates credentials
4. Backend generates JWT token
5. Frontend stores token securely (FlutterSecureStorage)
6. Frontend adds token to all API requests (Authorization header)
7. Backend validates token on each request

### **Security Features:**
- **Password Encryption:** BCrypt
- **Token Storage:** FlutterSecureStorage (encrypted)
- **API Security:** JWT Bearer tokens
- **HTTPS Only:** All API calls use HTTPS
- **Input Validation:** Both frontend and backend
- **SQL Injection Prevention:** JPA/Hibernate parameterized queries
- **XSS Prevention:** Input sanitization

---

## 📦 **DEPENDENCIES & PACKAGES**

### **Core Dependencies:**
```yaml
dependencies:
  # Flutter framework
  flutter:
    sdk: flutter
    
  # UI/UX
  google_fonts: ^6.1.0          # Custom fonts
  flutter_svg: ^2.0.9           # SVG support
  lottie: ^2.7.0                # Animations
  flutter_animate: ^4.2.0       # Advanced animations
  animated_text_kit: ^4.2.2     # Text animations
  smooth_page_indicator: ^1.1.0 # Page indicators
  cached_network_image: ^3.3.0  # Image caching
  
  # Navigation
  go_router: ^12.1.3            # Advanced routing
  
  # State Management
  provider: ^6.1.1              # State management
  
  # Networking
  dio: ^5.4.0                   # HTTP client
  http: ^1.1.0                  # Alternative HTTP
  
  # Storage
  shared_preferences: ^2.2.2    # Simple storage
  flutter_secure_storage: ^9.0.0 # Secure storage
  
  # Dependency Injection
  get_it: ^7.6.4                # Service locator
  
  # Utilities
  flutter_dotenv: ^5.1.0        # Environment variables
  logger: ^2.0.2+1              # Logging
  equatable: ^2.0.5             # Value equality
  intl: ^0.18.1                 # Internationalization
  uuid: ^4.3.3                  # UUID generation
  
  # Audio
  speech_to_text: ^7.0.0        # Speech recognition
  flutter_tts: ^4.0.2           # Text-to-speech
  record: ^5.1.2                # Audio recording
  just_audio: ^0.9.40           # Audio playback
  
  # Notifications
  flutter_local_notifications: ^16.3.0
  
  # Other
  pdf: ^3.11.0                  # PDF generation
  url_launcher: ^6.2.5          # URL launching
  responsive_framework: ^1.1.1  # Responsive design
  connectivity_plus: ^5.0.2     # Network status
  device_info_plus: ^9.1.1      # Device info
  package_info_plus: ^9.0.0     # Package info
  permission_handler: ^11.1.0   # Permissions
```

---

## 🎨 **DESIGN SYSTEM**

### **Theme Configuration** (`app_theme.dart`)
- Material Design 3
- Custom color palette
- Typography system
- Component themes

### **Color Palette** (`app_colors.dart`)
```dart
static const primary = Color(0xFF6366F1);      // Indigo
static const secondary = Color(0xFF8B5CF6);    // Purple
static const accent = Color(0xFF10B981);       // Green
static const background = Color(0xFFF9FAFB);   // Light gray
static const surface = Colors.white;
```

### **Spacing System** (`app_dimensions.dart`)
```dart
static const xs = 4.0;
static const sm = 8.0;
static const md = 16.0;
static const lg = 24.0;
static const xl = 32.0;
static const xxl = 48.0;
```

### **Responsive Breakpoints:**
- **Mobile:** < 600px
- **Tablet:** 600px - 900px
- **Desktop:** 900px - 1200px
- **Wide:** > 1200px

---

## 🧪 **TESTING STRATEGY**

### **1. Unit Tests**
- Test individual functions/services
- Mock external dependencies
- Test business logic

### **2. Widget Tests**
- Test UI components
- Test user interactions
- Test state changes

### **3. Integration Tests**
- Test complete user flows
- Test API integration
- End-to-end testing

---

## 🚀 **BUILD & DEPLOYMENT**

### **Development:**
```bash
flutter run --dart-define=ENV=development
```

### **Production Builds:**
```bash
# Android APK
flutter build apk --release

# Android App Bundle (Google Play)
flutter build appbundle --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

---

## 📊 **KEY METRICS**

**Lines of Code:** ~10,000+ (Flutter)  
**Number of Screens:** 15+  
**Number of Services:** 9  
**Number of Models:** 8  
**Number of Reusable Widgets:** 7+  
**Backend Models:** 27 JPA entities  
**API Endpoints:** 50+ endpoints  

---

## ✅ **FEATURE SUMMARY**

### **Learner Features:**
✅ Browse learning modules  
✅ Enroll in courses  
✅ Track progress  
✅ Take quizzes/exercises  
✅ Chat with AI coach  
✅ View certificates  
✅ Get personalized recommendations  

### **Trainer Features:**
✅ Create/edit courses  
✅ Manage content  
✅ View student progress  
✅ Submit content for validation  
✅ View analytics  

### **Admin Features:**
✅ User management  
✅ Content validation  
✅ Trainer management  
✅ AI supervision  
✅ System analytics  

---

## 🎯 **EXAMINATION KEY POINTS**

### **Architecture:**
- Clean Architecture with 3 layers
- Feature-based modularization
- Separation of concerns
- Dependency injection

### **State Management:**
- Provider pattern
- Centralized state
- Reactive updates

### **Data Flow:**
1. UI triggers action
2. Service called via dependency injection
3. API request sent via ApiService
4. Backend processes request
5. Response returned to service
6. Service updates state via Provider
7. UI rebuilds automatically

### **Best Practices:**
✅ SOLID principles  
✅ DRY (Don't Repeat Yourself)  
✅ Type safety  
✅ Error handling  
✅ Logging  
✅ Security best practices  
✅ Responsive design  
✅ Code documentation  

---

## 📚 **RELATED DOCUMENTATION**

- `ARCHITECTURE.md` - Detailed architecture guide
- `pubspec.yaml` - Dependencies and configuration
- `.env` - Environment variables
- `README.md` - Project overview
- Backend API documentation in Postman collection

---

**Generated:** December 19, 2025  
**Version:** 1.0.0  
**Author:** PFA Team
