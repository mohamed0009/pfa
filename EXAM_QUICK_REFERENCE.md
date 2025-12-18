# 📝 EXAM QUICK REFERENCE - COACH AI PLATFORM

## 🎯 ELEVATOR PITCH (30 seconds)

> "Coach AI is an **intelligent learning platform** that combines a **Flutter mobile app**, **Angular web app**, and **Spring Boot backend** to deliver **AI-powered personalized education**. It features a **virtual AI coach**, **adaptive learning paths**, **automated content generation**, and **comprehensive progress tracking** for students, trainers, and administrators."

---

## 🏗️ SYSTEM ARCHITECTURE (1 minute)

### Components
```
📱 MOBILE (Flutter)     🌐 WEB (Angular)
        ↕                      ↕
    REST API (HTTPS + JWT)
        ↕
🖥️ BACKEND (Spring Boot 3.2.0 + Java 17)
        ↕
🗄️ DATABASE (PostgreSQL - 40+ tables)
        +
🤖 AI SERVICES
   ├─ ML Model (Scikit-learn) - Recommendations
   └─ Ollama LLM - Conversational AI
```

### Technology Stack
- **Mobile**: Flutter 3.16+ (Dart 3.0+)
- **Web**: Angular 15+ (TypeScript)
- **Backend**: Spring Boot 3.2.0 (Java 17)
- **Database**: PostgreSQL 14+
- **AI**: Scikit-learn (87% F1), Ollama (qwen2.5:0.5b)

---

## 👥 USER ROLES (1 minute)

### 1. LEARNER (Student)
**Can do**:
- ✅ Enroll in courses
- ✅ Chat with AI coach
- ✅ Watch lessons, take quizzes
- ✅ Track personal progress
- ✅ Earn certificates

### 2. TRAINER (Teacher)
**Can do**:
- ✅ Create courses, quizzes, exercises
- ✅ Monitor student progress
- ✅ Grade submissions
- ✅ Generate AI-assisted content
- ✅ View analytics

### 3. ADMIN (Administrator)
**Can do**:
- ✅ Manage all users
- ✅ Validate content (approve/reject)
- ✅ Configure system settings
- ✅ Monitor AI interactions
- ✅ Generate reports

---

## 📊 DATABASE SCHEMA (2 minutes)

### Core Tables (40+ total)

#### User Management
```sql
users (id, email, password, role, formation, niveau)
learning_preferences (learning_pace, study_time_preference)
```

#### Content Hierarchy
```sql
formations (top-level curriculum)
  └─► modules (curriculum sections)
       └─► courses (individual courses)
            ├─► lessons (video, lecture, quiz, exercise)
            ├─► quizzes (with questions, options, attempts)
            └─► exercises (with submissions, grading)
```

#### Progress Tracking
```sql
enrollments (user ← → course relationship)
  └─► course_progress (overall metrics)
       └─► module_progress (per-module tracking)
```

#### AI Chat
```sql
conversations (user conversations)
  └─► chat_messages (user/AI messages)

ai_coach_sessions (course-specific AI sessions)
  └─► ai_coach_messages (session messages)
```

#### Support
```sql
support_tickets (help requests)
  └─► ticket_messages (support conversation)

user_notifications (alerts, reminders)
```

---

## 🔑 KEY FEATURES (2 minutes)

### 1. Multi-Platform Access
- **Mobile**: Native iOS/Android experience (Flutter)
- **Web**: Responsive SPA for admin/trainers (Angular)
- **API**: Single unified backend (Spring Boot)

### 2. AI-Powered Learning
- **AI Coach**: Real-time Q&A using Ollama LLM
- **Auto-Generation**: AI creates quizzes, exercises, explanations
- **Recommendations**: ML model (87% accuracy) suggests courses
- **Personalization**: Adapts to user level and preferences

### 3. Content Management
- **Hierarchy**: Formation → Module → Course → Lesson
- **Types**: Video, Lecture, Quiz, Exercise, AI Chat
- **Validation**: Trainer creates → Admin approves → Published
- **AI-Assisted**: Generate content ideas and suggestions

### 4. Progress & Analytics
- **Real-time Tracking**: Lessons, quizzes, time spent
- **Dashboards**: Role-specific views (Learner/Trainer/Admin)
- **Gamification**: Streaks, achievements, leaderboards
- **Reporting**: Comprehensive analytics for trainers/admins

---

## 🔐 SECURITY (1 minute)

### Authentication Flow
```
1. User submits email + password
2. Backend validates credentials
3. Password checked against BCrypt hash
4. JWT token generated (24h expiration)
5. Token stored securely on client
6. All subsequent requests include: 
   Authorization: Bearer {JWT}
```

### Security Measures
- ✅ **BCrypt** password hashing (cost factor 12)
- ✅ **JWT** token-based authentication
- ✅ **RBAC** role-based access control
- ✅ **Input Validation** (@Valid, constraints)
- ✅ **SQL Injection Prevention** (JPA parameterized queries)
- ✅ **HTTPS Only** in production
- ✅ **CORS** configured properly

---

## 🔄 HOW IT WORKS (3 minutes)

### Flow 1: Student Enrolls in Course
```
Mobile App         Backend API        Database
    │                  │                  │
    ├─ Login ─────────→│                  │
    │                  ├─ Validate ──────→│
    │←─ JWT token ─────┤                  │
    │                  │                  │
    ├─ GET /courses ──→│                  │
    │                  ├─ Query ─────────→│
    │←─ Course list ───┤                  │
    │                  │                  │
    ├─ POST /enroll ──→│                  │
    │                  ├─ Create entry ──→│
    │                  ├─ Init progress ─→│
    │←─ Success ───────┤                  │
```

### Flow 2: AI Coach Conversation
```
User Question → Frontend
             ↓
         POST /api/chat/conversations/{id}/messages
             ↓
         Backend receives message
             ↓
    Save to chat_messages (sender=USER)
             ↓
    Call AICoachService.generateResponse()
             ↓
    POST to Ollama LLM (/api/generate)
             ↓
    Receive AI-generated response
             ↓
    Save to chat_messages (sender=AI)
             ↓
    Return to Frontend
             ↓
    Display with typing animation
```

### Flow 3: Quiz Submission
```
1. User completes quiz
2. POST /api/quizzes/{id}/submit {answers}
3. Backend creates quiz_attempt record
4. For each answer:
   - Compare with correct_answer
   - Calculate points_earned
   - Store in quiz_answers
5. Calculate total score
6. Check if score ≥ passing_score
7. Update course_progress:
   - completed_quizzes++
   - Recalculate average_quiz_score
8. If all requirements met → mark course completed
9. Generate certificate (if applicable)
10. Return results to frontend
```

---

## 🚀 API ENDPOINTS (Quick Reference)

### Authentication
```
POST   /api/auth/login          - Login
POST   /api/auth/signup         - Register
POST   /api/auth/refresh        - Refresh token
GET    /api/auth/me             - Current user info
```

### Courses (User)
```
GET    /api/courses             - List all courses
GET    /api/courses/{id}        - Course details
POST   /api/enrollments         - Enroll in course
GET    /api/enrollments/user/{userId} - User enrollments
GET    /api/progress/user/{userId}    - User progress
```

### Chat
```
GET    /api/chat/conversations                    - List conversations
POST   /api/chat/conversations                    - Create conversation
GET    /api/chat/conversations/{id}/messages      - Get messages
POST   /api/chat/conversations/{id}/messages      - Send message
```

### Quizzes
```
GET    /api/quizzes/course/{courseId}   - Course quizzes
GET    /api/quizzes/{id}                - Quiz details
POST   /api/quizzes/{id}/submit         - Submit answers
GET    /api/quizzes/{id}/attempts/user/{userId} - User attempts
```

### Trainer
```
POST   /api/trainer/courses             - Create course
PUT    /api/trainer/courses/{id}        - Update course
POST   /api/trainer/courses/{id}/submit-validation - Submit for approval
GET    /api/trainer/students            - List students
GET    /api/trainer/students/{id}/progress - Student progress
```

### Admin
```
GET    /api/admin/users                 - List all users
POST   /api/admin/users                 - Create user
DELETE /api/admin/users/{id}            - Delete user
GET    /api/admin/content/pending       - Pending content
POST   /api/admin/content/courses/{id}/approve - Approve
POST   /api/admin/content/courses/{id}/reject  - Reject
```

---

## 💡 COMMON EXAM QUESTIONS & ANSWERS

### Q: Why use both Flutter and Angular?
**A**: Flutter for **mobile** (iOS/Android with single codebase), Angular for **web** (admin/trainer panels with complex dashboards). Different use cases, different platforms, but same backend API.

### Q: How does JWT authentication work?
**A**: User logs in → Backend validates → Generates JWT (signed token with user info) → Client stores token → All requests include "Authorization: Bearer {token}" header → Backend validates signature → Grants access.

### Q: What's the difference between formations, modules, and courses?
**A**: 
- **Formation** = Curriculum/Program (e.g., "Software Engineering")
- **Module** = Major section (e.g., "Backend Development")
- **Course** = Individual course (e.g., "Spring Boot Fundamentals")
- **Lesson** = Single learning unit (e.g., "What is REST API?")

### Q: How does the AI coach work?
**A**: User asks question → Backend sends to **Ollama LLM** (local language model) → LLM generates contextual response → Backend saves conversation → Returns to user. For recommendations, we use **scikit-learn ML model** (87% accuracy).

### Q: What happens when a student takes a quiz?
**A**: Creates **quiz_attempt** record → Evaluates each answer → Stores in **quiz_answers** → Calculates score → Updates **course_progress** → Checks passing criteria → Generates certificate if passed → Returns detailed feedback.

### Q: How is progress tracked?
**A**: Three levels:
1. **Enrollment** - User enrolled in course
2. **CourseProgress** - Overall metrics (completed lessons, avg score, time spent)
3. **ModuleProgress** - Per-module completion tracking

### Q: What's the content validation workflow?
**A**: Trainer creates (status=DRAFT) → Completes content → Submits (status=PENDING) → Admin reviews → Approves (status=APPROVED) OR Rejects (status=REJECTED with reason) → If approved, visible to students.

---

## 🎯 EXAM STRATEGY

### For Technical Questions:
1. **Start with architecture**: "The system uses 3-tier architecture..."
2. **Name technologies**: "Flutter mobile app, Spring Boot backend, PostgreSQL database..."
3. **Explain flow**: "When user does X, the system does Y..."
4. **Mention security**: "We use JWT authentication with BCrypt password hashing..."

### For Design Questions:
1. **Database**: "We have 40+ tables organized into 6 groups..."
2. **Relationships**: "Users have many enrollments, each enrollment has course progress..."
3. **Normalization**: "3NF - no duplicate data, separate tables for relationships..."

### For Implementation Questions:
1. **Backend**: "Spring Boot controller receives request → Service handles business logic → Repository queries database → Returns response"
2. **Frontend**: "User interacts with UI → Provider manages state → Service calls API → UI updates"
3. **AI**: "User question → Ollama LLM generates response → Saved to database → Displayed to user"

---

## ✅ FINAL CHECKLIST

Before exam, make sure you can explain:
- [ ] Overall system architecture (3-tier)
- [ ] Technology stack for each layer
- [ ] Database schema (main tables + relationships)
- [ ] User roles and permissions
- [ ] Authentication flow (JWT)
- [ ] Key features (AI coach, progress tracking, content management)
- [ ] How a complete user journey works (signup → enroll → learn → quiz → certificate)
- [ ] API endpoints and their purposes
- [ ] Security measures implemented
- [ ] Deployment architecture

---

## 🚀 BONUS POINTS

Mention these to impress:
- **Scalability**: "Stateless architecture allows horizontal scaling"
- **Security**: "Multiple layers - input validation, JWT, RBAC, BCrypt"
- **AI Integration**: "Hybrid approach - ML for recommendations, LLM for conversation"
- **Best Practices**: "Clean Architecture, RESTful API, normalized database"
- **User Experience**: "Multi-platform, real-time updates, offline support"
- **Performance**: "Database indexes, connection pooling, caching strategies"

---

**Good Luck! 🍀**

*Remember*: Understand the **concepts**, not just memorize. Be able to explain **why** decisions were made, not just **what** was implemented.
