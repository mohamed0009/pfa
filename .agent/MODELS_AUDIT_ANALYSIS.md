# 📊 Audit des Modèles - Domain Layer Analysis

## 🎯 Objectif
Vérifier si tous les modèles sont correctement placés dans la couche domaine (`lib/core/models/`) et identifier les modèles manquants par rapport au backend.

---

## ✅ Modèles Actuellement dans Core/Models (8 fichiers)

| # | Fichier | Classes | Backend Équivalent | Status |
|---|---------|---------|-------------------|--------|
| 1 | `user_model.dart` | UserModel | User.java | ✅ OK |
| 2 | `chat_message.dart` | ChatMessage | ChatMessage.java | ✅ OK |
| 3 | `conversation_model.dart` | Conversation | Conversation.java | ✅ OK |
| 4 | `learning_module.dart` | LearningModule, LearningContent | Module.java | ✅ OK |
| 5 | `progress_model.dart` | ProgressModel | CourseProgress.java, ModuleProgress.java | ✅ OK |
| 6 | `quiz_model.dart` | QuizModel, QuizQuestion | Quiz.java, QuizQuestion.java | ✅ OK |
| 7 | `trainer_models.dart` | Trainer entities | - | ✅ OK |
| 8 | `coach_recommendation.dart` | CoachRecommendation | AICoachMessage.java | ✅ OK |

---

## ⚠️ Modèles dans Features (À évaluer)

### 1. Admin Models (`lib/features/admin/models/ai_models.dart`)
**Classes définies :**
- `AIConfiguration` - Configuration de l'AI
- `AIInteraction` - Interactions avec l'AI
- `AIGeneratedContent` - Contenu généré par l'AI
- `AIKnowledgeDocument` - Documents de la base de connaissance
- `AIStatistics` - Statistiques de l'AI
- `SentimentBreakdown`
- `GeneratedContentCount`

**Analyse :**
- ✅ **Bien placé** - Spécifique à la feature Admin
- ❌ **Devrait être dans core** si utilisé par d'autres features
- 📝 **Recommandation** : Garder dans `features/admin/models/` car spécifique à l'administration

### 2. Dashboard Models (`lib/features/dashboard/models/trainer_models.dart`)
**Classes définies :**
- `TrainerFormation` - Formation créée par trainer
- `TrainerModule` - Module de formation
- `TrainerCourse` - Cours
- `StudentDashboard` - Dashboard étudiant
- `AtRiskStudent` - Étudiants à risque

**Analyse :**
- ⚠️ **PROBLÈME** : Duplication avec `lib/core/models/trainer_models.dart`
- 📝 **Recommandation** : **CONSOLIDER** dans `core/models/trainer_models.dart`

### 3. Presentation Models (`lib/features/dashboard/presentation/models/`)
**Problème :**
- ❌ **Mauvaise Architecture** : Les models ne doivent PAS être dans presentation
- 📝 **Recommandation** : **DÉPLACER** vers `features/dashboard/models/`

---

## ❌ Modèles Manquants (Backend → Flutter)

### Backend Entities sans équivalent Flutter

| # | Backend Entity | Description | Nécessaire? | Priorité |
|---|---------------|-------------|-------------|----------|
| 1 | `Course.java` | Cours détaillé | ⚠️ Oui | 🔴 Haute |
| 2 | `Formation.java` | Programme de formation | ⚠️ Oui | 🔴 Haute |
| 3 | `Lesson.java` | Leçon individuelle | ⚠️ Oui | 🔴 Haute |
| 4 | `Exercise.java` | Exercice | ✅ Oui | 🟡 Moyenne |
| 5 | `ExerciseSubmission.java` | Soumission exercice | ✅ Oui | 🟡 Moyenne |
| 6 | `Enrollment.java` | Inscription cours | ✅ Oui | 🟡 Moyenne |
| 7 | `QuizAttempt.java` | Tentative de quiz | ✅ Oui | 🟡 Moyenne |
| 8 | `QuizAnswer.java` | Réponse quiz | ✅ Oui | 🟡 Moyenne |
| 9 | `QuizOption.java` | Option de réponse | ✅ Oui | 🟡 Moyenne |
| 10 | `CourseResource.java` | Ressource de cours | ✅ Oui | 🟢 Basse |
| 11 | `LessonResource.java` | Ressource de leçon | ✅ Oui | 🟢 Basse |
| 12 | `LearningPreferences.java` | Préférences utilisateur | ✅ Oui | 🟢 Basse |
| 13 | `ChatAttachment.java` | Pièce jointe chat | ✅ Oui | 🟢 Basse |
| 14 | `AICoachSession.java` | Session AI Coach | ✅ Oui | 🟢 Basse |
| 15 | `UserNotification.java` | Notifications | ✅ Oui | 🟡 Moyenne |
| 16 | `SupportTicket.java` | Ticket de support | ✅ Oui | 🟢 Basse |
| 17 | `TicketMessage.java` | Message de ticket | ✅ Oui | 🟢 Basse |
| 18 | `ContentStatus.java` | Status de contenu (enum) | ✅ Oui | 🟡 Moyenne |

---

## 🎯 Modèles Prioritaires à Créer

### 🔴 Priorité HAUTE - Essentiels pour les features principales

#### 1. **course_model.dart**
```dart
class Course {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String longDescription;
  final String? instructorName;
  final String? instructorTitle;
  final String? thumbnailUrl;
  final String? previewVideoUrl;
  final String category;
  final DifficultyLevel level;
  final String language;
  final String duration;
  final double estimatedHours;
  final double rating;
  final int reviewsCount;
  final int enrolledCount;
  final double price;
  final List<String> skills;
  final List<String> learningObjectives;
  final List<String> prerequisites;
  final String moduleId;
  final List<Lesson> lessons;
  final ContentStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // fromJson, toJson, copyWith
}
```

**Raison :** Nécessaire pour afficher les cours dans l'app mobile

#### 2. **formation_model.dart**
```dart
class Formation {
  final String id;
  final String title;
  final String description;
  final String thumbnail;
  final DifficultyLevel level;
  final String category;
  final String domain;
  final String targetAudience;
  final int totalDuration;
  final int numberOfModules;
  final ContentStatus status;
  final List<Module> modules;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // fromJson, toJson, copyWith
}
```

**Raison :** Structure principale pour organiser les modules et cours

#### 3. **lesson_model.dart**
```dart
class Lesson {
  final String id;
  final String courseId;
  final String title;
  final String content;
  final String? videoUrl;
  final int duration;
  final int order;
  final ContentType type;
  final List<LessonResource> resources;
  final DateTime createdAt;
  
  // fromJson, toJson, copyWith
}
```

**Raison :** Contenu détaillé des cours

### 🟡 Priorité MOYENNE - Amélioration de l'expérience

#### 4. **exercise_model.dart**
```dart
class Exercise {
  final String id;
  final String courseId;
  final String title;
  final String description;
  final String content;
  final DifficultyLevel difficulty;
  final int estimatedTime;
  final List<String> hints;
  final String? solutionCode;
  final DateTime createdAt;
  
  // fromJson, toJson, copyWith
}

class ExerciseSubmission {
  final String id;
  final String exerciseId;
  final String userId;
  final String submittedCode;
  final String? feedback;
  final double? score;
  final bool isCorrect;
  final DateTime submittedAt;
  
  // fromJson, toJson, copyWith
}
```

**Raison :** Permettre les exercices pratiques

#### 5. **enrollment_model.dart**
```dart
class Enrollment {
  final String id;
  final String userId;
  final String courseId;
  final DateTime enrolledAt;
  final DateTime? completedAt;
  final double progress;
  final EnrollmentStatus status;
  final DateTime? lastAccessedAt;
  
  // fromJson, toJson, copyWith
}

enum EnrollmentStatus {
  active,
  completed,
  cancelled,
  expired,
}
```

**Raison :** Gérer les inscriptions aux cours

#### 6. **notification_model.dart**
```dart
class UserNotification {
  final String id;
  final String userId;
  final String title;
  final String message;
  final NotificationType type;
  final bool isRead;
  final Map<String, dynamic>? data;
  final DateTime createdAt;
  final DateTime? readAt;
  
  // fromJson, toJson, copyWith
}

enum NotificationType {
  course,
  quiz,
  exercise,
  message,
  system,
}
```

**Raison :** Notifications push et in-app

### 🟢 Priorité BASSE - Nice to have

#### 7. **resource_model.dart**
```dart
class CourseResource {
  final String id;
  final String courseId;
  final String title;
  final String description;
  final ResourceType type;
  final String url;
  final int fileSize;
  final DateTime uploadedAt;
  
  // fromJson, toJson, copyWith
}

enum ResourceType {
  pdf,
  video,
  document,
  link,
  image,
}
```

#### 8. **support_model.dart**
```dart
class SupportTicket {
  final String id;
  final String userId;
  final String subject;
  final String category;
  final TicketStatus status;
  final TicketPriority priority;
  final List<TicketMessage> messages;
  final DateTime createdAt;
  final DateTime? resolvedAt;
  
  // fromJson, toJson, copyWith
}

class TicketMessage {
  final String id;
  final String ticketId;
  final String senderId;
  final String content;
  final bool isStaff;
  final DateTime sentAt;
  
  // fromJson, toJson, copyWith
}
```

---

## 📋 Enums Manquants

### À créer dans `lib/core/models/enums.dart`

```dart
// Déjà défini dans trainer_models.dart, mais devrait être global
enum ContentStatus {
  draft,
  pending,
  approved,
  published,
  rejected,
  archived,
}

enum DifficultyLevel {
  beginner,    // DEBUTANT
  intermediate, // INTERMEDIAIRE
  advanced,     // AVANCE
}

enum EnrollmentStatus {
  active,
  completed,
  cancelled,
  expired,
}

enum NotificationType {
  course,
  quiz,
  exercise,
  message,
  achievement,
  system,
}

enum ResourceType {
  pdf,
  video,
  document,
  link,
  image,
  audio,
}

enum TicketStatus {
  open,
  inProgress,
  resolved,
  closed,
}

enum TicketPriority {
  low,
  medium,
  high,
  urgent,
}
```

---

## 🔧 Actions Recommandées

### 🎯 Actions Immédiates (Haute Priorité)

1. **Créer les modèles manquants essentiels**
   ```bash
   lib/core/models/
   ├── course_model.dart        # NEW
   ├── formation_model.dart     # NEW
   ├── lesson_model.dart        # NEW
   └── enums.dart               # NEW (centraliser tous les enums)
   ```

2. **Consolider trainer_models.dart**
   - Fusionner `features/dashboard/models/trainer_models.dart` dans `core/models/trainer_models.dart`
   - Supprimer les duplications

3. **Déplacer les models de presentation**
   ```
   features/dashboard/presentation/models/ → features/dashboard/models/
   ```

### 🟡 Actions Moyennes (Priorité Moyenne)

4. **Créer les modèles d'interaction**
   ```bash
   lib/core/models/
   ├── exercise_model.dart      # NEW
   ├── enrollment_model.dart    # NEW
   ├── notification_model.dart  # NEW
   └── quiz_attempt_model.dart  # NEW (étendre quiz_model.dart)
   ```

5. **Compléter quiz_model.dart**
   - Ajouter `QuizAttempt`
   - Ajouter `QuizAnswer`
   - Ajouter `QuizOption`

### 🟢 Actions Basses (Nice to Have)

6. **Créer les modèles auxiliaires**
   ```bash
   lib/core/models/
   ├── resource_model.dart      # NEW
   ├── support_model.dart       # NEW
   └── preferences_model.dart   # NEW
   ```

---

## 📊 Structure Recommandée Finale

```
lib/core/models/
├── user_model.dart              ✅ Existe
├── chat_message.dart            ✅ Existe
├── conversation_model.dart      ✅ Existe
├── learning_module.dart         ✅ Existe (Module)
├── progress_model.dart          ✅ Existe
├── quiz_model.dart              ✅ Existe (à compléter)
├── trainer_models.dart          ✅ Existe (à consolider)
├── coach_recommendation.dart    ✅ Existe
│
├── course_model.dart            ❌ À CRÉER (HAUTE)
├── formation_model.dart         ❌ À CRÉER (HAUTE)
├── lesson_model.dart            ❌ À CRÉER (HAUTE)
├── exercise_model.dart          ❌ À CRÉER (MOYENNE)
├── enrollment_model.dart        ❌ À CRÉER (MOYENNE)
├── notification_model.dart      ❌ À CRÉER (MOYENNE)
├── resource_model.dart          ❌ À CRÉER (BASSE)
├── support_model.dart           ❌ À CRÉER (BASSE)
├── preferences_model.dart       ❌ À CRÉER (BASSE)
└── enums.dart                   ❌ À CRÉER (HAUTE)
```

---

## 🎯 Mapping Backend → Flutter

| Backend Entity | Flutter Model | Priorité | Status |
|----------------|---------------|----------|--------|
| User.java | user_model.dart | - | ✅ Existe |
| ChatMessage.java | chat_message.dart | - | ✅ Existe |
| Conversation.java | conversation_model.dart | - | ✅ Existe |
| Module.java | learning_module.dart | - | ✅ Existe |
| CourseProgress.java | progress_model.dart | - | ✅ Existe |
| ModuleProgress.java | progress_model.dart | - | ✅ Existe |
| Quiz.java | quiz_model.dart | - | ✅ Existe |
| QuizQuestion.java | quiz_model.dart | - | ✅ Existe |
| AICoachMessage.java | coach_recommendation.dart | - | ✅ Existe |
| **Course.java** | **course_model.dart** | 🔴 HAUTE | ❌ Manquant |
| **Formation.java** | **formation_model.dart** | 🔴 HAUTE | ❌ Manquant |
| **Lesson.java** | **lesson_model.dart** | 🔴 HAUTE | ❌ Manquant |
| Exercise.java | exercise_model.dart | 🟡 MOYENNE | ❌ Manquant |
| ExerciseSubmission.java | exercise_model.dart | 🟡 MOYENNE | ❌ Manquant |
| Enrollment.java | enrollment_model.dart | 🟡 MOYENNE | ❌ Manquant |
| QuizAttempt.java | quiz_model.dart (à étendre) | 🟡 MOYENNE | ⚠️ Partiel |
| QuizAnswer.java | quiz_model.dart (à étendre) | 🟡 MOYENNE | ⚠️ Partiel |
| QuizOption.java | quiz_model.dart (à étendre) | 🟡 MOYENNE | ⚠️ Partiel |
| UserNotification.java | notification_model.dart | 🟡 MOYENNE | ❌ Manquant |
| CourseResource.java | resource_model.dart | 🟢 BASSE | ❌ Manquant |
| LessonResource.java | resource_model.dart | 🟢 BASSE | ❌ Manquant |
| SupportTicket.java | support_model.dart | 🟢 BASSE | ❌ Manquant |
| TicketMessage.java | support_model.dart | 🟢 BASSE | ❌ Manquant |
| LearningPreferences.java | preferences_model.dart | 🟢 BASSE | ❌ Manquant |
| ChatAttachment.java | chat_message.dart (à étendre) | 🟢 BASSE | ⚠️ Partiel |
| AICoachSession.java | conversation_model.dart (à étendre) | 🟢 BASSE | ⚠️ Partiel |

---

## ✅ Résumé

### Statistiques
- **Modèles existants** : 8 fichiers
- **Modèles manquants (priorité HAUTE)** : 3
- **Modèles manquants (priorité MOYENNE)** : 6
- **Modèles manquants (priorité BASSE)** : 6
- **Total modèles manquants** : 15

### Couverture Actuelle
- ✅ **Fonctionnalités couvertes** : User, Chat, Quiz basique, Progress
- ⚠️ **Fonctionnalités partielles** : Learning (manque Course, Formation, Lesson)
- ❌ **Fonctionnalités manquantes** : Exercises, Enrollment, Notifications, Support

### Recommandation Finale
**Pour l'examen :**
1. Créer les 3 modèles prioritaires (Course, Formation, Lesson)
2. Consolider les trainer_models.dart
3. Créer enums.dart pour centraliser tous les enums
4. Le reste peut être créé progressivement

**Architecture actuelle : 📊 60% complète**
**Architecture recommandée pour production : 📊 100% complète**

---

**Généré le :** 19 Décembre 2025  
**Auteur :** Audit Architecture PFA
