# 📚 COACH AI - COMPLETE SYSTEM OVERVIEW & EXAMINATION GUIDE
**Version**: 1.0.0 | **Date**: December 18, 2025 | **Status**: Production Ready

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Architecture Components](#2-architecture-components)
3. [Mobile Application (Flutter)](#3-mobile-application-flutter)
4. [Web Application (Angular)](#4-web-application-angular)
5. [Backend System (Spring Boot)](#5-backend-system-spring-boot)
6. [Database Schema (PostgreSQL)](#6-database-schema-postgresql)
7. [AI/ML Model](#7-aiml-model)
8. [How The System Works](#8-how-the-system-works)
9. [User Flows](#9-user-flows)
10. [Security & Authentication](#10-security--authentication)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)

---

## 1. SYSTEM OVERVIEW

### 🎯 What is Coach AI?

**Coach AI** is an intelligent learning platform that combines:
- **Personalized Learning**: Adaptive course recommendations
- **AI-Powered Coaching**: Interactive virtual coach using LLM
- **Multi-Platform Access**: Mobile (Flutter) + Web (Angular)
- **Comprehensive Tracking**: Progress monitoring and analytics
- **Role-Based Management**: Admin, Trainer, and Learner roles

### 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                          │
├──────────────────────┬──────────────────────────────────────────┤
│  Mobile App          │         Web Application                  │
│  (Flutter/Dart)      │         (Angular/TypeScript)            │
│  - iOS/Android       │         - Modern SPA                     │
│  - Native UI         │         - Responsive Design              │
│  - Offline Support   │         - Admin Dashboard                │
└──────────────────────┴──────────────────────────────────────────┘
                              ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER (Spring Boot)                   │
├─────────────────────────────────────────────────────────────────┤
│  • JWT Authentication & Authorization                            │
│  • RESTful API Endpoints (25+ Controllers)                      │
│  • Business Logic Layer (Services)                              │
│  • Data Access Layer (JPA Repositories)                         │
│  • AI Integration (Ollama LLM + ML Model)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↕ JPA/JDBC
┌─────────────────────────────────────────────────────────────────┐
│                   DATA LAYER (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────┤
│  • 40+ Tables                                                    │
│  • Relational Data Model                                         │
│  • ACID Transactions                                             │
│  • Indexes for Performance                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 🔑 Key Features

1. **Multi-Role System**
   - **Admin**: User & content management, system configuration
   - **Trainer**: Course creation, student monitoring, analytics
   - **Learner**: Course enrollment, AI chat, progress tracking

2. **AI-Powered Learning**
   - Interactive AI coach for Q&A
   - Auto-generated quizzes & exercises
   - Personalized course recommendations
   - Intelligent content suggestions

3. **Comprehensive Learning Management**
   - Formations → Modules → Courses → Lessons
   - Video lectures, documents, exercises, quizzes
   - Progress tracking and analytics
   - Certificates upon completion

---

## 2. ARCHITECTURE COMPONENTS

### 🎨 Frontend Technologies

#### Mobile App (Flutter)
- **Framework**: Flutter 3.16+
- **Language**: Dart 3.0+
- **State Management**: Provider
- **Routing**: GoRouter
- **Dependency Injection**: GetIt
- **HTTP Client**: Dio
- **Local Storage**: SharedPreferences, Secure Storage

#### Web App (Angular)
- **Framework**: Angular 15+
- **Language**: TypeScript
- **UI Components**: Custom component library
- **State Management**: RxJS
- **HTTP Client**: HttpClient
- **Routing**: Angular Router

### ⚙️ Backend Technologies

#### Application Server
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Build Tool**: Maven
- **Architecture**: Clean Architecture (3-layer)

#### Core Dependencies
```xml
• Spring Boot Starter Web      - REST API
• Spring Boot Data JPA         - ORM/Database
• Spring Boot Security         - Authentication/Authorization
• PostgreSQL Driver            - Database connectivity
• JWT (jjwt)                   - Token-based auth
• Lombok                       - Boilerplate reduction
• Validation                   - Input validation
• Jackson                      - JSON serialization
```

### 🗄️ Database
- **DBMS**: PostgreSQL 14+
- **Schema**: 40+ tables, 100+ columns
- **Design**: Normalized (3NF), relational
- **Features**: Transactions, constraints, indexes

### 🤖 AI/ML Components

#### Machine Learning Model
- **Framework**: Scikit-learn (Python)
- **Algorithm**: Gradient Boosting
- **Performance**: 87% F1 Score
- **Use Case**: Content recommendation, difficulty prediction

#### Large Language Model
- **Service**: Ollama
- **Model**: qwen2.5:0.5b
- **Use Case**: AI coach conversational responses

---

## 3. MOBILE APPLICATION (FLUTTER)

### 📱 Architecture Overview

```
lib/
├── core/                          # Core functionality
│   ├── models/                    # Data models (User, Course, Quiz, etc.)
│   ├── providers/                 # State management (Provider)
│   ├── services/                  # Business logic services
│   │   ├── auth_service.dart     # Authentication
│   │   ├── ai_coach_service.dart # AI chat
│   │   └── learning_service.dart # Course/module management
│   ├── routes/                    # Navigation (GoRouter)
│   └── theme/                     # App theming
├── features/                      # Feature modules
│   ├── auth/                      # Login/Register screens
│   ├── dashboard/                 # Role-based dashboards
│   ├── chat/                      # AI coach chat
│   ├── learning/                  # Course/module screens
│   ├── profile/                   # User profile
│   └── settings/                  # App settings
└── widgets/                       # Reusable UI components
```

### 🎯 Key Features

#### 1. Authentication Flow
```dart
LoginScreen → UserProvider.login(email, password)
           → AuthService.login() → API call to /api/auth/login
           → Store JWT token → Navigate to Dashboard
```

#### 2. AI Coach Chat
- Real-time messaging interface
- Context-aware responses
- Message history
- Quick action buttons
- Typing indicators

#### 3. Learning Modules
- Hierarchical content structure
- Progress tracking per module
- Quiz integration
- Resource downloads

#### 4. Role-Based Dashboards

**Learner Dashboard**:
- Total modules, completed, in progress
- Score average
- Quick actions (Chat, Modules, Quiz)
- Recent activity feed

**Trainer Dashboard**:
- Student statistics
- Module management
- Student monitoring
- Content creation tools

**Admin Dashboard**:
- System overview
- User management
- Content approval
- Analytics & reports

### 📊 State Management (Provider)

```dart
UserProvider
├── currentUser: UserModel?
├── isAuthenticated: bool
├── login(email, password): Future<bool>
├── logout(): Future<void>
└── updateProfile(...): Future<void>
```

### 🔐 Security Features
- Secure token storage (FlutterSecureStorage)
- Auto token refresh
- Biometric authentication (optional)
- Session timeout handling

---

## 4. WEB APPLICATION (ANGULAR)

### 🌐 Architecture Overview

```
coach_ai_frontend/
├── src/
│   ├── app/
│   │   ├── core/                 # Core services & guards
│   │   │   ├── services/         # API, Auth, Storage
│   │   │   └── guards/           # Route guards
│   │   ├── shared/               # Shared components/pipes
│   │   ├── features/             # Feature modules
│   │   │   ├── auth/            # Authentication
│   │   │   ├── dashboard/       # Admin/Trainer dashboards
│   │   │   ├── courses/         # Course management
│   │   │   ├── students/        # Student management
│   │   │   └── ai-supervision/  # AI monitoring
│   │   └── layouts/              # Page layouts
│   └── assets/                   # Static assets
```

### 🎯 Key Features

#### 1. Admin Dashboard
- User management (CRUD)
- Content validation workflow
- System statistics
- AI supervision panel

#### 2. Trainer Dashboard
- Course creation & editing
- Student progress monitoring
- Quiz/Exercise builder
- Analytics & reports

#### 3. Student Interface
- Course catalog browsing
- Enrollment management
- Progress tracking
- Certificate downloads

### 🔄 HTTP Interceptors
```typescript
AuthInterceptor: Add JWT token to all requests
ErrorInterceptor: Handle API errors globally
LoadingInterceptor: Show/hide loading spinner
```

---

## 5. BACKEND SYSTEM (SPRING BOOT)

### 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
│  Controllers (REST API Endpoints)                            │
│  - AuthController                                            │
│  - CourseController, ModuleController, QuizController       │
│  - ChatController, UserController                           │
│  - Admin/Trainer specific controllers                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  Business Logic                                              │
│  - UserService, AuthService, CourseService                  │
│  - QuizService, ChatService, AICoachService                 │
│  - ValidationService, NotificationService                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 REPOSITORY LAYER                             │
│  Data Access (Spring Data JPA)                               │
│  - UserRepository, CourseRepository, etc.                   │
│  - Custom queries with @Query                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
│  JPA Entities (Models)                                       │
│  - User, Course, Module, Quiz, ChatMessage, etc.            │
└─────────────────────────────────────────────────────────────┘
```

### 📋 API Controllers (25+)

#### Authentication
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    POST /api/auth/login      - Login with credentials
    POST /api/auth/signup     - Register new user
    POST /api/auth/refresh    - Refresh JWT token
    GET  /api/auth/me         - Get current user info
}
```

#### User Management
```java
// User Controllers
CourseController         - Course CRUD operations
UserEnrollmentController - Enrollment management
UserProgressController   - Progress tracking
UserQuizController       - Quiz attempts
ChatController          - AI chat conversations

// Trainer Controllers
TrainerCourseController    - Course management for trainers
TrainerStudentController   - Student monitoring
TrainerQuizController      - Quiz creation
TrainerModuleController    - Module management

// Admin Controllers
AdminUserController        - User management
AdminContentController     - Content validation
AdminAiController          - AI supervision
```

### 🔐 Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    // JWT Filter Chain
    - Extract JWT from Authorization header
    - Validate token signature & expiration
    - Load user details from database
    - Set authentication in SecurityContext
    
    // Endpoint Security
    - /api/auth/** : permitAll()
    - /api/admin/** : hasRole('ADMIN')
    - /api/trainer/** : hasAnyRole('ADMIN', 'TRAINER')
    - /api/** : authenticated()
}
```

### 📊 JPA Entities (27 Models)

**Core Models**:
- `User` - User accounts with roles
- `LearningPreferences` - User learning preferences
- `Formation` - Top-level curriculum
- `Module` - Curriculum modules
- `Course` - Individual courses
- `Lesson` - Course lessons
- `Quiz`, `QuizQuestion`, `QuizOption`, `QuizAttempt`
- `Exercise`, `ExerciseSubmission`
- `Enrollment`, `CourseProgress`, `ModuleProgress`
- `Conversation`, `ChatMessage`
- `AICoachSession`, `AICoachMessage`
- `SupportTicket`, `TicketMessage`
- `UserNotification`

**Relationships**:
```
Formation (1) ──────────(N) Module
Module (1) ─────────────(N) Course
Course (1) ─────────────(N) Lesson
Course (1) ─────────────(N) Quiz
Course (1) ─────────────(N) Exercise

User (1) ───────────────(N) Enrollment
Enrollment (1) ─────────(1) CourseProgress
CourseProgress (1) ─────(N) ModuleProgress

User (1) ───────────────(N) Conversation
Conversation (1) ───────(N) ChatMessage
```

---

## 6. DATABASE SCHEMA (POSTGRESQL)

### 🗄️ Database Structure

**Total Tables**: 40+  
**Total Columns**: 300+  
**Indexes**: 50+

### 📊 Main Table Groups

#### 1. User Management (3 tables)
```sql
users
├── id (PK)
├── email (UNIQUE)
├── password (hashed)
├── first_name, last_name
├── role (ADMIN/TRAINER/USER)
├── status, formation, niveau
└── preferences_id (FK → learning_preferences)

learning_preferences
├── id (PK)
├── learning_pace
├── study_time_preference
├── notifications_enabled
└── weekly_goal_hours

preferred_content_types
└── Many-to-many relationship
```

#### 2. Learning Content (11 tables)
```sql
formations
├── id, title, description
├── level, category, status
├── created_by (FK → users)
└── validated_by (FK → users)

modules
├── id, formation_id (FK)
├── title, description, module_order
└── status, created_by, validated_by

courses
├── id, module_id (FK)
├── title, description, instructor_name
├── level, category, duration
├── status, is_ai_generated
└── skills[], objectives[], prerequisites[]

lessons
├── id, course_id (FK)
├── type (VIDEO/LECTURE/QUIZ/EXERCISE/AI_CHAT)
├── title, video_url, transcript
└── lesson_order

course_resources
└── PDF, VIDEO, LINK, DOCUMENT
```

#### 3. Assessments (8 tables)
```sql
quizzes
├── id, course_id (FK)
├── title, difficulty, duration
├── passing_score, max_attempts
└── is_ai_generated

quiz_questions
├── id, quiz_id (FK)
├── type (MULTIPLE_CHOICE/TRUE_FALSE/SHORT_ANSWER/CODE)
├── question, explanation, points
└── question_order

quiz_options
└── For multiple choice questions

quiz_attempts
├── id, quiz_id (FK), user_id (FK)
├── score, passed, time_spent
└── started_at, submitted_at

quiz_answers
└── Individual question answers

exercises
├── id, course_id (FK)
├── title, instructions, difficulty
└── is_ai_generated

exercise_submissions
└── Student submissions with grading
```

#### 4. Progress Tracking (3 tables)
```sql
enrollments
├── id, user_id (FK), course_id (FK)
├── status (ACTIVE/COMPLETED/DROPPED)
├── enrolled_at, completed_at
└── certificate_earned, certificate_url

course_progress
├── id, enrollment_id (FK)
├── overall_progress, completed_lessons
├── average_quiz_score, total_time_spent
└── current_streak, last_activity_date

module_progress
├── id, progress_id (FK), module_id (FK)
└── progress_percentage, is_completed
```

#### 5. AI Chat (6 tables)
```sql
conversations
├── id, user_id (FK)
├── title, messages_count
└── is_active

chat_messages
├── id, conversation_id (FK)
├── sender (USER/AI)
├── content, type
└── timestamp

ai_coach_sessions
├── id, course_id (FK), user_id (FK)
├── lesson_id (FK)
└── is_active

ai_coach_messages
└── Session-specific messages
```

#### 6. Support & Notifications (3 tables)
```sql
support_tickets
├── id, ticket_number (UNIQUE)
├── subject, description, category
├── priority, status
└── user_id (FK), assigned_to (FK)

ticket_messages
└── Support conversation messages

user_notifications
├── id, user_id (FK)
├── type (REMINDER/NEW_CONTENT/MOTIVATION/ALERT/ACHIEVEMENT)
├── title, message, priority
└── is_read, read_at
```

### 🔗 Key Relationships

```
User ────┬────→ Enrollments ────→ Courses
         ├────→ Conversations
         ├────→ SupportTickets
         ├────→ QuizAttempts
         └────→ ExerciseSubmissions

Formation ──→ Modules ──→ Courses ──→ Lessons
                            ├────→ Quizzes
                            └────→ Exercises

Enrollment ──→ CourseProgress ──→ ModuleProgress
```

### 📈 Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);

-- Course searches
CREATE INDEX idx_course_module ON courses(module_id);
CREATE INDEX idx_course_category ON courses(category);
CREATE INDEX idx_course_status ON courses(status);

-- Progress tracking
CREATE INDEX idx_enrollment_user ON enrollments(user_id);
CREATE INDEX idx_enrollment_course ON enrollments(course_id);

-- Chat performance
CREATE INDEX idx_conversation_user ON conversations(user_id);
CREATE INDEX idx_chat_message_conversation ON chat_messages(conversation_id);
```

---

## 7. AI/ML MODEL

### 🤖 Machine Learning Component

#### Purpose
- Personalized course recommendations
- Difficulty level prediction
- Learning path optimization
- Content quality assessment

#### Technology Stack
```python
Framework: Scikit-learn
Algorithm: Gradient Boosting Classifier
Features: TF-IDF vectorization (100+ features)
Performance: 87% F1 Score
Training Data: 8+ educational datasets
Model Size: 247 KB
```

#### Training Pipeline
```python
1. Data Collection
   └── 8+ sources (Kaggle, educational repositories)

2. Preprocessing
   ├── Text cleaning
   ├── TF-IDF vectorization
   └── Feature extraction

3. Model Training
   ├── Gradient Boosting (best: 87% F1)
   ├── Random Forest (85% F1)
   └── SVM, Logistic Regression tested

4. Model Serving
   └── FastAPI endpoint at port 8000
```

#### API Endpoints
```python
POST /predict
{
  "text": "course content description",
  "features": {...}
}
→ Returns: difficulty level, category, recommended prerequisites
```

### 💬 Large Language Model (Ollama)

#### Configuration
```yaml
Service: Ollama
Model: qwen2.5:0.5b
Purpose: Conversational AI coach
Deployment: Local server
API: HTTP REST
```

#### Capabilities
- Natural language Q&A
- Code explanation
- Concept clarification
- Study tips & motivation
- Quiz generation assistance

#### Integration Flow
```
User Question → ChatController → AICoachService
             → Ollama API (POST /api/generate)
             → Context-aware response
             → Save to chat_messages table
             → Return to user
```

---

## 8. HOW THE SYSTEM WORKS

### 🔄 Complete User Journey

#### 1. User Registration & Login
```
Step 1: User opens mobile app or web app
Step 2: Clicks "Register" → Fills form (name, email, password, role)
Step 3: Frontend validates input
Step 4: POST /api/auth/signup with user data
Step 5: Backend validates, hashes password (BCrypt)
Step 6: Creates User entity, saves to database
Step 7: Generates JWT token
Step 8: Returns token + user data to frontend
Step 9: Frontend stores token in secure storage
Step 10: Redirects to role-appropriate dashboard
```

**Security**: Password hashed with BCrypt, JWT with 24h expiration

#### 2. Course Browsing & Enrollment
```
Step 1: User navigates to "Courses" screen
Step 2: GET /api/courses?category=X&level=Y
Step 3: Backend queries courses table with filters
Step 4: Returns paginated course list
Step 5: User selects a course
Step 6: GET /api/courses/{id} for details
Step 7: User clicks "Enroll"
Step 8: POST /api/enrollments {userId, courseId}
Step 9: Backend creates Enrollment + CourseProgress records
Step 10: Returns enrollment confirmation
```

#### 3. Learning with AI Coach
```
Step 1: User clicks "Chat with Coach"
Step 2: GET /api/chat/conversations → Shows conversation history
Step 3: User selects conversation or creates new one
Step 4: POST /api/chat/conversations {title}
Step 5: User types message
Step 6: POST /api/chat/conversations/{id}/messages {content}
Step 7: Backend saves user message to chat_messages
Step 8: Backend calls AICoachService.generateResponse()
Step 9: AICoachService contacts Ollama LLM
Step 10: Ollama generates contextual response
Step 11: Backend saves AI response to chat_messages
Step 12: Returns response to frontend
Step 13: Frontend displays message with typing animation
```

#### 4. Taking a Quiz
```
Step 1: User completes course lessons
Step 2: Clicks "Take Quiz"
Step 3: GET /api/quizzes/course/{courseId}
Step 4: Backend retrieves quiz with all questions & options
Step 5: Frontend displays questions one by one (or all at once)
Step 6: User answers all questions
Step 7: POST /api/quizzes/{quizId}/submit {answers}
Step 8: Backend creates QuizAttempt record
Step 9: Evaluates each answer, calculates score
Step 10: Updates CourseProgress (completed_quizzes++)
Step 11: Checks if passing score met
Step 12: Returns results {score, passed, feedback}
Step 13: Frontend displays results with explanations
Step 14: If passed, updates enrollment status
```

#### 5. Progress Tracking
```
Automatic Updates:
- Every lesson completion → update course_progress.completed_lessons
- Every quiz attempt → update course_progress.average_quiz_score
- Every session → update course_progress.total_time_spent
- Streak calculation based on last_activity_date

Dashboard Display:
GET /api/progress/user/{userId}
→ Aggregates data from course_progress, module_progress
→ Calculates percentages, averages
→ Returns statistics for dashboard
```

#### 6. Trainer Content Creation
```
Step 1: Trainer logs in → sees TrainerDashboard
Step 2: Clicks "Create Course"
Step 3: Fills course form (title, description, level, etc.)
Step 4: Optionally requests AI-generated content
Step 5: POST /api/trainer/courses {courseData}
Step 6: Backend creates Course with status=DRAFT
Step 7: Trainer adds lessons, quizzes, exercises
Step 8: POST /api/trainer/courses/{id}/lessons
Step 9: When ready, clicks "Submit for Validation"
Step 10: PATCH /api/trainer/courses/{id}/submit-validation
Step 11: Backend updates status=PENDING
Step 12: Sends notification to admin
```

#### 7. Admin Content Validation
```
Step 1: Admin sees notification of new content
Step 2: Navigates to AdminContentController
Step 3: GET /api/admin/content/pending
Step 4: Reviews course details
Step 5: Option A: Approve
   POST /api/admin/content/courses/{id}/approve
   → Backend sets status=APPROVED
   → Sends notification to trainer
Step 6: Option B: Reject
   POST /api/admin/content/courses/{id}/reject {reason}
   → Backend sets status=REJECTED
   → Stores rejection_reason
   → Sends notification to trainer
```

### 🔁 Data Flow Examples

#### Example 1: Student Enrolls in Course
```
Mobile App                 Backend API              Database
    │                          │                        │
    ├─ POST /enrollments ─────→│                        │
    │                          ├─ Validate user/course→ │
    │                          ├─ Create enrollment ───→│
    │                          ├─ Create progress ─────→│
    │                          ├─ Update course count ─→│
    │                          │                        │
    │←─── enrollment data ─────┤                        │
    │                          │                        │
```

#### Example 2: AI Chat Conversation
```
User                  Frontend                Backend              Ollama
 │                        │                       │                   │
 ├─ Types message ───────→│                       │                   │
 │                        ├─ POST /chat/msg ─────→│                   │
 │                        │                       ├─ Save user msg ───→DB
 │                        │                       ├─ POST /generate ──→│
 │                        │                       │                   │
 │                        │                       │←─ AI response ─────┤
 │                        │                       ├─ Save AI msg ─────→DB
 │                        │←─ Response message ───┤                   │
 │←─ Display message ─────┤                       │                   │
```

---

## 9. USER FLOWS

### 👨‍🎓 Learner Flow

```
1. ONBOARDING
   ├─ Register account (email, password, name)
   ├─ Select role: "Learner"
   ├─ Fill profile (formation, niveau)
   ├─ Set learning preferences
   └─ Complete onboarding tutorial

2. COURSE DISCOVERY
   ├─ Browse course catalog
   ├─ Filter by category, level, popularity
   ├─ View course details
   ├─ Check prerequisites
   ├─ Enroll in course
   └─ Start learning

3. LEARNING PROCESS
   ├─ View course curriculum
   ├─ Watch video lessons
   ├─ Read lecture materials
   ├─ Download resources
   ├─ Complete exercises
   ├─ Take quizzes
   ├─ Ask AI coach questions
   └─ Track progress

4. ASSESSMENT
   ├─ Complete all lessons
   ├─ Take final quiz
   ├─ Achieve passing score
   ├─ Receive certificate
   └─ Share achievement

5. CONTINUOUS LEARNING
   ├─ View recommendations
   ├─ Enroll in next course
   ├─ Review past content
   └─ Maintain learning streak
```

### 👨‍🏫 Trainer Flow

```
1. CONTENT CREATION
   ├─ Create formation (curriculum)
   ├─ Add modules to formation
   ├─ Create courses in modules
   ├─ Add lessons to courses
   │  ├─ Upload video lessons
   │  ├─ Write lecture notes
   │  └─ Add resources
   ├─ Create quizzes
   │  ├─ Write questions
   │  ├─ Set correct answers
   │  └─ Add explanations
   ├─ Create exercises
   └─ Submit for validation

2. STUDENT MONITORING
   ├─ View enrolled students
   ├─ Check progress statistics
   ├─ Identify struggling students
   ├─ Send motivational messages
   └─ Answer support tickets

3. GRADING & FEEDBACK
   ├─ Review exercise submissions
   ├─ Provide feedback
   ├─ Assign scores
   └─ Validate completion

4. ANALYTICS
   ├─ View course statistics
   ├─ Analyze quiz performance
   ├─ Generate reports
   └─ Optimize content
```

### 👨‍💼 Admin Flow

```
1. USER MANAGEMENT
   ├─ View all users
   ├─ Filter by role/status
   ├─ Create new users
   ├─ Edit user details
   ├─ Suspend/activate users
   └─ Delete users

2. CONTENT VALIDATION
   ├─ Review pending content
   │  ├─ Formations
   │  ├─ Modules
   │  ├─ Courses
   │  ├─ Quizzes
   │  └─ Exercises
   ├─ Approve quality content
   ├─ Reject with reasons
   └─ Request revisions

3. SYSTEM CONFIGURATION
   ├─ Configure AI settings
   ├─ Set learning parameters
   ├─ Manage categories
   ├─ Configure notifications
   └─ Update system settings

4. AI SUPERVISION
   ├─ Monitor AI interactions
   ├─ Review generated content
   ├─ Adjust AI parameters
   └─ Handle AI incidents

5. REPORTING
   ├─ System health metrics
   ├─ User growth statistics
   ├─ Content usage analytics
   ├─ Revenue reports
   └─ Export data
```

---

## 10. SECURITY & AUTHENTICATION

### 🔐 Authentication Flow (JWT)

```
1. USER LOGIN
   ┌─────────────┐
   │   Client    │
   └──────┬──────┘
          │ POST /api/auth/login
          │ {email, password}
          ▼
   ┌─────────────────────┐
   │   AuthController    │
   └──────┬──────────────┘
          │ verify credentials
          ▼
   ┌─────────────────────┐
   │   UserService       │
   └──────┬──────────────┘
          │ load user from DB
          │ check password hash
          ▼
   ┌─────────────────────┐
   │   JwtUtil           │
   └──────┬──────────────┘
          │ generate token
          │ sign with secret key
          ▼
   ┌─────────────────────┐
   │   Client            │
   │  stores JWT token   │
   └─────────────────────┘

2. AUTHENTICATED REQUEST
   ┌─────────────┐
   │   Client    │
   └──────┬──────┘
          │ GET /api/courses
          │ Header: Authorization: Bearer {JWT}
          ▼
   ┌─────────────────────┐
   │  JwtAuthFilter      │
   │  - Extract token    │
   │  - Validate         │
   │  - Load user        │
   └──────┬──────────────┘
          │ SecurityContext.setAuth()
          ▼
   ┌─────────────────────┐
   │  CourseController   │
   │  (authorized)       │
   └─────────────────────┘
```

### 🛡️ Security Measures

#### Password Security
```java
// BCrypt hashing (cost factor: 12)
String hashedPassword = BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));
boolean matches = BCrypt.checkpw(plainPassword, hashedPassword);
```

#### JWT Configuration
```java
- Algorithm: HS256 (HMAC-SHA256)
- Expiration: 24 hours
- Refresh token: 7 days
- Claims: userId, email, role
- Secret: Stored in environment variable
```

#### Role-Based Access Control (RBAC)
```java
@PreAuthorize("hasRole('ADMIN')")
public List<User> getAllUsers() { }

@PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
public Course createCourse(@RequestBody CourseDTO dto) { }

@PreAuthorize("hasRole('USER') and #userId == authentication.principal.id")
public Progress getUserProgress(@PathVariable String userId) { }
```

#### Input Validation
```java
@Valid annotation on DTOs
@NotNull, @NotBlank, @Email, @Size constraints
Custom validators for business rules
SQL injection prevention via JPA parameterized queries
XSS prevention via input sanitization
```

#### API Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

---

## 11. DEPLOYMENT & INFRASTRUCTURE

### 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION SETUP                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Mobile     │     │     Web      │     │   Admin      │
│   Clients    │────→│   (Nginx)    │────→│   Panel      │
└──────────────┘     └──────┬───────┘     └──────────────┘
                             │
                             ▼
                     ┌───────────────┐
                     │ Load Balancer │
                     └───────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  Backend   │  │  Backend   │  │  Backend   │
    │  Instance1 │  │  Instance2 │  │  Instance3 │
    └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
          └────────────────┼────────────────┘
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   (Primary)     │
                  └────────┬────────┘
                           │ replication
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   (Replica)     │
                  └─────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Ollama LLM  │  │  ML Service  │  │   Storage    │
│   Server     │  │  (FastAPI)   │  │   (S3/CDN)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 📦 Docker Configuration

#### Backend Dockerfile
```dockerfile
FROM openjdk:17-slim
WORKDIR /app
COPY target/coach-ai-backend-1.0.0.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
CMD ["java", "-jar", "app.jar"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=jdbc:postgresql://db:5432/coach_ai_db
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
  
  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=coach_ai_db
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=${DB_PASSWORD}
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
```

### 🔧 Configuration Management

#### Environment Variables
```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/coach_ai_db
DB_USERNAME=admin
DB_PASSWORD=***

# JWT
JWT_SECRET=***
JWT_EXPIRATION=86400000  # 24 hours

# AI Services
OLLAMA_URL=http://localhost:11434
ML_SERVICE_URL=http://localhost:8000

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=***
SMTP_PASSWORD=***

# Storage
AWS_ACCESS_KEY=***
AWS_SECRET_KEY=***
AWS_S3_BUCKET=coach-ai-assets
```

### 📊 Monitoring & Logging

```
Spring Boot Actuator:
- /actuator/health       - Health check
- /actuator/metrics      - Application metrics
- /actuator/info         - App information

Logging:
- Logback configuration
- Daily rolling file appender
- Error logs to separate file
- JSON format for log aggregation

Monitoring Tools:
- Prometheus (metrics collection)
- Grafana (visualization)
- ELK Stack (log analysis)
- Sentry (error tracking)
```

---

## 📚 SUMMARY

### ✅ What You've Learned

1. **System Architecture**
   - 3-tier architecture (Frontend, Backend, Database)
   - Microservices-ready design
   - RESTful API communication

2. **Frontend Applications**
   - Flutter mobile app for iOS/Android
   - Angular web app for admin/trainers
   - Shared backend API

3. **Backend System**
   - Spring Boot 3.2.0 with Java 17
   - 25+ REST controllers
   - JWT-based authentication
   - Role-based access control

4. **Database**
   - PostgreSQL with 40+ tables
   - Normalized relational design
   - Comprehensive data model

5. **AI Integration**
   - Machine Learning model (87% accuracy)
   - Ollama LLM for conversational AI
   - Auto-generated content

6. **Security**
   - BCrypt password hashing
   - JWT token authentication
   - RBAC authorization
   - Input validation

7. **User Flows**
   - Learner journey
   - Trainer workflow
   - Admin management

### 🎯 Key Takeaways

✅ **Multi-platform Learning System**  
✅ **AI-Powered Personalization**  
✅ **Comprehensive Content Management**  
✅ **Robust Security & Authentication**  
✅ **Scalable Architecture**  
✅ **Production-Ready Deployment**

---

## 📞 NEXT STEPS

1. **For Examination**:
   - Review architecture diagrams
   - Understand data flow
   - Practice explaining each component

2. **For Development**:
   - Set up development environment
   - Run backend locally
   - Test API endpoints
   - Deploy to staging

3. **For Production**:
   - Configure environment variables
   - Set up monitoring
   - Deploy with Docker
   - Configure SSL/TLS

---

**Document Version**: 1.0.0  
**Last Updated**: December 18, 2025  
**Author**: Coach AI Development Team
