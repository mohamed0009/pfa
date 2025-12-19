# 📚 Quick Examination Guide - PFA Coach AI Platform

## 🎯 **1-MINUTE OVERVIEW**

**What is it?**  
A mobile learning platform connecting learners, trainers, and administrators through AI-powered coaching.

**Tech Stack:**
- **Frontend:** Flutter (Dart) - Cross-platform mobile app
- **Backend:** Spring Boot 3.2 (Java 17) - REST API
- **Database:** PostgreSQL - Relational database
- **Authentication:** JWT (JSON Web Tokens)

---

## 🏗️ **ARCHITECTURE LAYERS (Clean Architecture)**

### **Flutter Mobile App**

```
┌─────────────────────────────────────────┐
│     PRESENTATION LAYER                  │
│  ├─ Screens (15+ screens)               │
│  ├─ Widgets (7 reusable components)     │
│  └─ UI State (Provider)                 │
├─────────────────────────────────────────┤
│     DOMAIN LAYER                        │
│  ├─ Models (8 domain entities)          │
│  ├─ Business Rules                      │
│  └─ Use Cases                           │
├─────────────────────────────────────────┤
│     DATA LAYER                          │
│  ├─ Services (9 core services)          │
│  ├─ API Client (Dio HTTP)               │
│  └─ Local Storage (Secure + Shared)     │
└─────────────────────────────────────────┘
           ↕️ REST API (JSON/JWT)
┌─────────────────────────────────────────┐
│     SPRING BOOT BACKEND                 │
│  ├─ Controllers (26 REST endpoints)     │
│  ├─ Services (Business logic)           │
│  ├─ Repositories (JPA/Hibernate)        │
│  └─ Security (JWT + BCrypt)             │
├─────────────────────────────────────────┤
│     POSTGRESQL DATABASE                 │
│  └─ 27 Tables (JPA Entities)            │
└─────────────────────────────────────────┘
```

---

## 📱 **FLUTTER WIDGETS & SCREENS**

### **10 Main Features:**

| Feature | Screens | Purpose |
|---------|---------|---------|
| **Auth** | Login, Register, Forgot Password | User authentication |
| **Onboarding** | Welcome carousel | First-time user experience |
| **Splash** | Loading screen | App initialization |
| **Dashboard** | Learner/Trainer/Admin | Role-based home screens |
| **Chat** | AI Chat, Conversation List | AI coaching interface |
| **Learning** | Modules, Detail, Quiz, Exercise | Course learning |
| **Profile** | Profile screen | User information |
| **Settings** | Settings screen | App preferences |
| **Home** | Home screen | Navigation hub |
| **Admin** | 5 admin screens | System management |

### **7 Reusable Widgets:**
1. **CustomButton** - Action buttons with loading states
2. **CustomCard** - Card containers with elevation
3. **CustomTextField** - Validated input fields
4. **StatCard** - Dashboard statistics display
5. **ModuleCard** - Learning module previews
6. **ProgressBar** - Progress indicators
7. **LoadingOverlay** - Full-screen loading

---

## 🔧 **CORE SERVICES (Data Layer)**

| Service | Responsibility | Backend Integration |
|---------|----------------|---------------------|
| **ApiService** | HTTP client management | All endpoints |
| **AuthService** | Authentication & sessions | `/api/auth/*` |
| **LearningService** | Courses & modules | `/api/user/courses`, `/api/user/progress` |
| **ConversationService** | Chat management | `/api/user/chat/*` |
| **AiCoachService** | AI interactions | `/api/user/chat/conversations/{id}/messages` |
| **StorageService** | Local/secure storage | N/A (local only) |
| **AudioService** | Voice input/output | N/A (local only) |
| **TrainerService** | Trainer features | `/api/trainer/*` |
| **LoggerService** | Application logging | N/A (local only) |

---

## 📊 **DATA MODELS (Domain Layer)**

### **Flutter Models (8 models):**

```dart
1. UserModel          - User entity (id, email, name, role, preferences)
2. ChatMessage        - Chat message (content, timestamp, isUser)
3. Conversation       - Chat session (messages, title, createdAt)
4. LearningModule     - Course/module (title, description, progress)
5. ProgressModel      - User progress (completion%, timeSpent)
6. QuizModel          - Quiz/assessment (questions, scoring)
7. TrainerModels      - Trainer-specific entities
8. CoachRecommendation - AI recommendations
```

### **Mapping to Backend:**

| Flutter Model | Backend Entity | Purpose |
|---------------|----------------|---------|
| `UserModel` | `User.java` | User accounts |
| `ChatMessage` | `ChatMessage.java` | Chat messages |
| `Conversation` | `Conversation.java` | Chat sessions |
| `LearningModule` | `Module.java`, `Course.java` | Learning content |
| `ProgressModel` | `CourseProgress.java`, `ModuleProgress.java` | Progress tracking |
| `QuizModel` | `Quiz.java`, `QuizQuestion.java` | Assessments |

---

## 🗄️ **DATABASE MODELS (27 JPA Entities)**

### **Core Entities:**

**User Management:**
- `User` - User accounts (id, email, password, role, status)
- `LearningPreferences` - User learning preferences

**Learning Structure:**
- `Formation` - Learning programs (e.g., "Computer Science")
- `Module` - Course modules (e.g., "Data Structures")
- `Course` - Individual courses
- `Lesson` - Course lessons
- `LessonResource` - Lesson materials (PDFs, videos)
- `CourseResource` - Course-level resources
- `CourseProgress` - User course completion
- `ModuleProgress` - User module completion

**Assessments:**
- `Quiz` - Quizzes
- `QuizQuestion` - Quiz questions
- `QuizOption` - Multiple-choice options
- `QuizAnswer` - User answers
- `QuizAttempt` - User quiz attempts
- `Exercise` - Practice exercises
- `ExerciseSubmission` - Student submissions

**Chat/AI:**
- `Conversation` - Chat sessions
- `ChatMessage` - Individual messages
- `ChatAttachment` - File attachments
- `AICoachSession` - AI coaching sessions
- `AICoachMessage` - AI responses

**Enrollment & Tracking:**
- `Enrollment` - Course enrollments
- `UserNotification` - User notifications

**Support:**
- `SupportTicket` - Support tickets
- `TicketMessage` - Ticket communication

---

## 🔌 **BACKEND API ENDPOINTS**

### **Authentication (3 endpoints):**
```
POST /api/auth/register      - Register new user
POST /api/auth/login         - User login (returns JWT)
POST /api/auth/refresh-token - Refresh expired token
```

### **User Endpoints (10 categories):**
```
/api/user/profile            - GET, PUT (User profile)
/api/user/courses            - GET (Available courses)
/api/user/progress           - GET, POST (Progress tracking)
/api/user/quizzes            - GET, POST (Quiz attempts)
/api/user/exercises          - GET, POST (Exercise submissions)
/api/user/enroll             - POST (Course enrollment)
/api/user/notifications      - GET (User notifications)
/api/user/certificates       - GET (Earned certificates)
/api/user/support            - POST (Create support ticket)
/api/user/chat/*             - Chat management (see below)
```

### **Chat Endpoints (5 endpoints):**
```
GET  /api/user/chat/conversations              - List all conversations
POST /api/user/chat/conversations              - Create new conversation
GET  /api/user/chat/conversations/{id}         - Get conversation details
POST /api/user/chat/conversations/{id}/messages - Send message
DELETE /api/user/chat/conversations/{id}       - Delete conversation
```

### **Trainer Endpoints (11 categories):**
```
/api/trainer/courses         - GET, POST, PUT (Course management)
/api/trainer/modules         - GET, POST, PUT (Module management)
/api/trainer/formations      - GET, POST, PUT (Formation management)
/api/trainer/exercises       - GET, POST, PUT (Exercise management)
/api/trainer/quizzes         - GET, POST, PUT (Quiz management)
/api/trainer/students        - GET (Student list & progress)
/api/trainer/stats           - GET (Trainer analytics)
/api/trainer/reviews         - GET (Student reviews)
/api/trainer/validation      - POST (Submit content for approval)
/api/trainer/messages        - GET, POST (Communication)
/api/trainer/profile         - GET, PUT (Trainer profile)
```

### **Admin Endpoints (4 categories):**
```
/api/admin/users             - GET, PUT, DELETE (User management)
/api/admin/content           - GET, PUT, DELETE (Content validation)
/api/admin/trainers          - GET, PUT, DELETE (Trainer management)
/api/admin/ai/*              - AI supervision & configuration
```

---

## 🔐 **SECURITY & AUTHENTICATION**

### **Authentication Flow:**
```
1. User enters credentials in Flutter app
2. POST /api/auth/login (email, password)
3. Backend validates with BCrypt
4. Backend generates JWT token
5. Flutter stores token in FlutterSecureStorage
6. All API calls include: Authorization: Bearer <token>
7. Backend validates JWT on each request
8. Token expires → Refresh with /api/auth/refresh-token
```

### **Security Measures:**
- ✅ **Passwords:** BCrypt hashing (backend)
- ✅ **Tokens:** JWT with expiration
- ✅ **Storage:** FlutterSecureStorage (encrypted)
- ✅ **Transport:** HTTPS only
- ✅ **SQL Injection:** Parameterized queries (JPA)
- ✅ **Input Validation:** Frontend & backend
- ✅ **Role-based Access:** User/Trainer/Admin roles

---

## 📦 **KEY DEPENDENCIES**

### **Flutter (pubspec.yaml):**

**Networking:**
- `dio: ^5.4.0` - Advanced HTTP client
- `http: ^1.1.0` - Basic HTTP

**State Management:**
- `provider: ^6.1.1` - State management
- `get_it: ^7.6.4` - Dependency injection

**Storage:**
- `flutter_secure_storage: ^9.0.0` - Encrypted storage
- `shared_preferences: ^2.2.2` - Simple storage

**UI/UX:**
- `google_fonts: ^6.1.0` - Custom fonts
- `go_router: ^12.1.3` - Navigation
- `lottie: ^2.7.0` - Animations
- `cached_network_image: ^3.3.0` - Image caching

**Audio:**
- `speech_to_text: ^7.0.0` - Voice input
- `flutter_tts: ^4.0.2` - Voice output
- `record: ^5.1.2` - Audio recording
- `just_audio: ^0.9.40` - Audio playback

### **Backend (pom.xml):**
- `spring-boot-starter-web` - REST API
- `spring-boot-starter-data-jpa` - Database ORM
- `spring-boot-starter-security` - Security
- `postgresql` - Database driver
- `jjwt` - JWT tokens
- `lombok` - Boilerplate reduction

---

## 🎯 **USER ROLES & FEATURES**

| Role | Features | Access Level |
|------|----------|--------------|
| **Learner** | • Browse & enroll in courses<br>• Chat with AI coach<br>• Track progress<br>• Take quizzes/exercises<br>• View certificates | Basic |
| **Trainer** | • Create/edit content<br>• Manage students<br>• View analytics<br>• Submit for validation<br>• Communicate with learners | Medium |
| **Admin** | • All trainer features<br>• User management<br>• Content validation<br>• Trainer management<br>• AI supervision<br>• System analytics | Full |

---

## 📊 **PROJECT STATISTICS**

| Metric | Count |
|--------|-------|
| **Flutter Screens** | 15+ |
| **Reusable Widgets** | 7 |
| **Core Services** | 9 |
| **Flutter Models** | 8 |
| **Backend Controllers** | 26 |
| **Backend Entities** | 27 |
| **API Endpoints** | 50+ |
| **Lines of Code (Flutter)** | ~10,000+ |
| **Lines of Code (Backend)** | ~15,000+ |

---

## 🔄 **DATA FLOW EXAMPLE: Learner Takes a Quiz**

```
1. User taps "Start Quiz" (LearningModuleScreen)
   ↓
2. QuizScreen widget loads
   ↓
3. Calls LearningService.getQuiz(moduleId)
   ↓
4. LearningService calls ApiService.get('/api/user/quizzes/{id}')
   ↓
5. ApiService sends GET request with JWT token
   ↓
6. Backend: UserQuizController.getQuiz()
   ↓
7. Backend: QuizService.findById()
   ↓
8. Backend: QuizRepository.findById() → PostgreSQL
   ↓
9. Database returns Quiz entity (questions, options)
   ↓
10. Backend converts to JSON
   ↓
11. ApiService receives response
   ↓
12. LearningService converts JSON to QuizModel
   ↓
13. QuizScreen receives QuizModel
   ↓
14. UI rebuilds with quiz questions
   ↓
15. User answers questions
   ↓
16. User taps "Submit"
   ↓
17. Calls LearningService.submitQuiz(quizId, answers)
   ↓
18. ApiService sends POST to '/api/user/quizzes/{id}/submit'
   ↓
19. Backend: UserQuizController.submitQuiz()
   ↓
20. Backend: QuizService.gradeQuiz() (calculates score)
   ↓
21. Backend saves QuizAttempt to database
   ↓
22. Backend returns score & feedback
   ↓
23. QuizScreen shows results
```

---

## 🎨 **DESIGN SYSTEM**

### **Color Palette:**
```dart
Primary:    #6366F1 (Indigo)
Secondary:  #8B5CF6 (Purple)
Accent:     #10B981 (Green)
Background: #F9FAFB (Light Gray)
Surface:    #FFFFFF (White)
Error:      #EF4444 (Red)
```

### **Typography:**
- **Font Family:** Google Fonts (Inter, Roboto)
- **Headings:** Bold, 24-32px
- **Body:** Regular, 14-16px
- **Captions:** Regular, 12px

### **Spacing:**
```dart
XS:  4px
SM:  8px
MD:  16px
LG:  24px
XL:  32px
XXL: 48px
```

---

## ✅ **EXAMINATION CHECKLIST**

### **Architecture Questions:**
- ✅ Explain 3-layer Clean Architecture
- ✅ Why use feature-based structure?
- ✅ How does dependency injection work?
- ✅ What is the role of Provider?

### **Data Flow Questions:**
- ✅ How does authentication work?
- ✅ Explain API request lifecycle
- ✅ How is state managed?
- ✅ How do models map between Flutter & backend?

### **Backend Questions:**
- ✅ What entities exist in database?
- ✅ How are relationships defined (JPA)?
- ✅ What is JWT authentication?
- ✅ How are passwords secured?

### **Mobile Questions:**
- ✅ What screens exist for each role?
- ✅ How are widgets reused?
- ✅ What services handle what responsibilities?
- ✅ How is secure storage implemented?

---

## 🚀 **QUICK DEMO TALKING POINTS**

1. **"Multi-role platform with 3 user types"**  
   Show learner/trainer/admin dashboards

2. **"Clean Architecture with clear separation"**  
   Explain layers: Presentation → Domain → Data

3. **"8 core Flutter models mapping to 27 backend entities"**  
   Show User, Course, Quiz, Progress models

4. **"9 specialized services for different responsibilities"**  
   API, Auth, Learning, Chat, Storage, etc.

5. **"50+ REST API endpoints with JWT security"**  
   Show Postman collection or Swagger docs

6. **"AI-powered chat for personalized learning"**  
   Demo conversation interface

7. **"Comprehensive progress tracking"**  
   Show dashboard with stats & charts

8. **"Secure authentication with encrypted storage"**  
   Explain JWT + FlutterSecureStorage

---

## 📄 **RELATED FILES**

- **Full Structure:** `FLUTTER_EXAMINATION_STRUCTURE.md`
- **Architecture:** `ARCHITECTURE.md`
- **Dependencies:** `pubspec.yaml`
- **Backend Config:** `backend/pom.xml`
- **Environment:** `.env`

---

**Good luck with your examination! 🎓**

---

**Generated:** December 19, 2025  
**Version:** 1.0.0
