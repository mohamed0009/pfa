# Nouvelle Architecture des Formations - Coach AI

## 📋 Résumé des Changements

### Structure Simplifiée
- **AVANT**: Formation → Module → Course → Lesson/Quiz
- **MAINTENANT**: Formation → Module (avec Texte, Vidéo, Lab, Quiz directement)

### Nouveaux Concepts
1. **Formateur Assigné**: Chaque formation a un formateur assigné (`assignedTo`)
2. **Modules Autonomes**: Chaque module contient directement son contenu
3. **Progression par Module**: Suivi détaillé de chaque élément (texte, vidéo, lab, quiz)
4. **Déblocage Séquentiel**: Les modules sont débloqués dans l'ordre

---

## 🗄️ Structure de Base de Données

### Formation
```java
- id
- title
- description
- category (spécialité)
- level (DEBUTANT, INTERMEDIAIRE, AVANCE)
- status (DRAFT, PENDING, PUBLISHED, REJECTED, ARCHIVED)
- createdBy (User - formateur ou admin)
- assignedTo (User - formateur assigné) ⭐ NOUVEAU
- createdAt
- submittedForValidationAt
- validatedAt
- publishedAt ⭐ NOUVEAU
- validatedBy
- rejectionReason
```

### Module (Refondu)
```java
- id
- formationId
- title
- description
- order
- status
- textContent (TEXT) ⭐ NOUVEAU - remplace les cours
- videoUrl (TEXT) ⭐ NOUVEAU
- labContent (TEXT) ⭐ NOUVEAU
- quiz (OneToOne) ⭐ NOUVEAU - directement dans le module
- isLocked (boolean) ⭐ NOUVEAU - débloqué après validation précédent
- duration
- createdBy
```

### ModuleProgress (Nouveau)
```java
- id
- enrollmentId (FormationEnrollment)
- moduleId (Module)
- textCompleted (boolean)
- videoCompleted (boolean)
- labCompleted (boolean)
- quizCompleted (boolean)
- quizScore (Double)
- isModuleValidated (boolean) ⭐ Valide si quiz réussi
- textCompletedAt
- videoCompletedAt
- labCompletedAt
- quizCompletedAt
- completedAt
```

### Quiz (Modifié)
```java
- id
- courseId (nullable) - pour compatibilité ancien système
- moduleId (nullable) ⭐ NOUVEAU - pour nouveau système
- title
- description
- questions (List<QuizQuestion>)
- passingScore
```

---

## 🔄 Workflow Complet

### 1. Création de Formation

#### Par Formateur
```
Formateur crée Formation
    ↓
status = DRAFT
assignedTo = formateur (auto-assigné)
    ↓
Formateur soumet pour validation
    ↓
status = PENDING
submittedForValidationAt = now()
    ↓
Admin notifié ⚠️
```

#### Par Admin
```
Admin crée Formation
    ↓
status = DRAFT ou PUBLISHED (selon choix)
    ↓
Admin peut:
  - Assigner à un formateur (assignedTo)
  - Publier directement (status = PUBLISHED)
  - Laisser en DRAFT pour modification
```

### 2. Validation Admin

```
Admin reçoit notification
    ↓
Vérifie structure:
  ✓ Au moins 1 module
  ✓ Chaque module a: texte, vidéo, lab, quiz
    ↓
  ├─→ Approuve
  │   status = PUBLISHED
  │   validatedAt = now()
  │   publishedAt = now()
  │   ↓
  │   Notifie:
  │   - Formateur assigné ✅
  │   - Étudiants ciblés (si généré par AI) ✅
  │
  └─→ Rejette
      status = REJECTED
      rejectionReason = "..."
      ↓
      Notifie Formateur avec feedback ⚠️
```

### 3. Inscription Étudiant

```
Étudiant recherche formation
  (par spécialité + niveau)
    ↓
Étudiant s'inscrit
    ↓
FormationEnrollment créé
    ↓
Notifie:
  - Admin ⚠️
  - Formateur assigné ⚠️
    ↓
ModuleProgress créé pour chaque module
  (premier module débloqué, autres verrouillés)
```

### 4. Suivi Progression

```
Étudiant suit Module 1:
  1. Lit texte → textCompleted = true
  2. Regarde vidéo → videoCompleted = true
  3. Fait lab → labCompleted = true
  4. Passe quiz → quizCompleted = true
     ↓
  Si quizScore >= passingScore:
    isModuleValidated = true
    Module 2 débloqué (isLocked = false)
    ↓
  Répète pour Module 2, 3, ...
    ↓
  Tous modules validés:
    Formation complétée ✅
    Certificat généré
```

---

## 🤖 Génération AI

```
Étudiant pose questions (≥5)
    ↓
Analyse ML:
  - Détecte spécialité (ex: React)
  - Détecte niveau (ex: AVANCE)
    ↓
Système génère Formation:
  - Crée Formation avec modules
  - Assigne à formateur spécialisé (assignedTo)
  - status = PENDING
    ↓
Notifie Formateur assigné ⚠️
  "Nouvelle formation AI à valider"
    ↓
Formateur peut:
  - Modifier/améliorer
  - Soumettre pour validation admin
```

---

## 📊 Notifications

| Événement | Destinataire | Type | Priorité |
|-----------|--------------|------|----------|
| Formation créée (formateur) | Admin | VALIDATION | HIGH |
| Formation approuvée | Formateur + Étudiants | NEW_CONTENT | HIGH |
| Formation rejetée | Formateur | ALERT | MEDIUM |
| Étudiant s'inscrit | Admin + Formateur | ENROLLMENT | MEDIUM |
| Module complété | Formateur (optionnel) | PROGRESS | LOW |
| Formation complétée | Admin + Formateur | ACHIEVEMENT | HIGH |

---

## 🔧 Modifications Backend Requises

### 1. Modèles Modifiés
- ✅ `Formation.java` - Ajout `assignedTo`, `publishedAt`
- ✅ `Module.java` - Refonte: `textContent`, `videoUrl`, `labContent`, `quiz`, `isLocked`
- ✅ `Quiz.java` - Ajout `moduleId` (en plus de `courseId` pour compatibilité)
- ✅ `ModuleProgress.java` - Nouveau modèle créé

### 2. Services à Modifier
- ✅ `FormationValidationService.java` - Validation selon nouvelle structure
- ⚠️ `FormationRecommendationService.java` - Génération AI avec assignation formateur
- ⚠️ `FormationEnrollmentService.java` - Création ModuleProgress lors inscription
- ⚠️ `ModuleProgressService.java` - Nouveau service pour gérer progression

### 3. Contrôleurs à Modifier
- ⚠️ `TrainerFormationController.java` - Gestion formations assignées
- ⚠️ `AdminContentController.java` - Assignation formateur, approbation
- ⚠️ `UserFormationController.java` - Recherche, inscription, progression

### 4. Repositories
- ✅ `ModuleProgressRepository.java` - Nouveau repository créé

---

## 📝 Règles Métier

### Création
1. Formateur peut créer formation → auto-assigné
2. Admin peut créer formation → peut assigner ou laisser non assignée
3. Formation AI générée → assignée automatiquement au formateur spécialisé

### Validation
1. Formation doit avoir ≥1 module
2. Chaque module doit avoir: texte, vidéo, lab, quiz
3. Quiz doit avoir ≥1 question
4. Formateur assigné recommandé (warning si absent)

### Progression
1. Premier module toujours débloqué
2. Module suivant débloqué après validation du précédent
3. Module validé = quiz réussi (score ≥ passingScore)
4. Formation complétée = tous modules validés

### Recherche
1. Étudiants peuvent rechercher par:
   - Spécialité (category)
   - Niveau (level)
   - Statut = PUBLISHED uniquement

---

## 🚀 Prochaines Étapes

1. ✅ Modèles créés/modifiés
2. ✅ Validation service mis à jour
3. ⚠️ Services de progression à créer
4. ⚠️ Contrôleurs à mettre à jour
5. ⚠️ Frontend à adapter
6. ⚠️ Migration base de données

---

## 📌 Notes Importantes

- **Compatibilité**: Quiz garde `courseId` pour compatibilité avec ancien système
- **Migration**: Les formations existantes avec Course devront être migrées
- **Performance**: Modules chargés en EAGER pour affichage rapide
- **Sécurité**: Seul le formateur assigné peut modifier sa formation (sauf admin)

