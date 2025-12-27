# Architecture des Formations - Coach AI

## Structure de Base de Données

```
┌─────────────────┐
│   Formation     │
├─────────────────┤
│ id              │
│ title           │
│ description     │
│ category        │
│ level           │
│ status          │
│ createdBy       │ (User - formateur ou admin)
│ assignedTo      │ (User - formateur assigné)
│ createdAt       │
│ submittedAt     │
│ validatedAt     │
│ publishedAt     │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│    Module       │
├─────────────────┤
│ id              │
│ formationId     │
│ title           │
│ description     │
│ order           │
│ status          │
│ textContent     │ (TEXT - contenu texte)
│ videoUrl        │ (VARCHAR - URL vidéo)
│ labContent      │ (TEXT - contenu lab/TP)
│ quizId          │ (FK vers Quiz)
│ isLocked        │ (boolean - débloqué après validation précédent)
│ createdBy       │
└─────────────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│     Quiz        │
├─────────────────┤
│ id              │
│ moduleId        │
│ title           │
│ questions       │ (List<QuizQuestion>)
│ passingScore    │
└─────────────────┘

┌─────────────────┐
│  Enrollment     │
├─────────────────┤
│ id              │
│ studentId       │ (User)
│ formationId    │
│ enrolledAt      │
│ status          │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ ModuleProgress  │
├─────────────────┤
│ id              │
│ enrollmentId    │
│ moduleId        │
│ textCompleted   │
│ videoCompleted  │
│ labCompleted    │
│ quizCompleted   │
│ quizScore       │
│ isModuleValidated│
│ completedAt     │
└─────────────────┘
```

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    CRÉATION                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Formateur ou Admin crée Formation                          │
│         │                                                    │
│         ├─→ Si Formateur: status = DRAFT                   │
│         │   └─→ Soumission → status = PENDING               │
│         │                                                    │
│         └─→ Si Admin: status = DRAFT ou PUBLISHED           │
│             └─→ Peut assigner à un formateur                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  VALIDATION ADMIN                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Admin reçoit notification                                  │
│         │                                                    │
│         ├─→ Vérifie structure complète                      │
│         │   • Au moins 1 module                            │
│         │   • Chaque module a: texte, vidéo, lab, quiz      │
│         │                                                    │
│         ├─→ Approuve → status = PUBLISHED                   │
│         │   └─→ Notifie Formateur + Étudiants ciblés        │
│         │                                                    │
│         └─→ Rejette → status = DRAFT                        │
│             └─→ Notifie Formateur avec feedback             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PUBLICATION                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Formation PUBLISHED                                         │
│         │                                                    │
│         ├─→ Visible dans catalogue                          │
│         │                                                    │
│         ├─→ Étudiants peuvent s'inscrire                    │
│         │   └─→ Notifie Admin + Formateur                   │
│         │                                                    │
│         └─→ Formateur peut suivre progression               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUIVI ÉTUDIANT                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Étudiant suit modules dans l'ordre                         │
│         │                                                    │
│         ├─→ Module 1: Texte → Vidéo → Lab → Quiz          │
│         │   └─→ Quiz validé → Module 1 validé              │
│         │                                                    │
│         ├─→ Module 2 débloqué                               │
│         │   └─→ Répète le processus                         │
│         │                                                    │
│         └─→ Tous modules validés → Formation complétée       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## États de Formation

```
DRAFT → PENDING → PUBLISHED → ARCHIVED
  │        │          │
  │        │          └─→ Peut être modifiée (retour DRAFT)
  │        │
  │        └─→ Peut être rejetée (retour DRAFT)
  │
  └─→ Peut être supprimée si aucun étudiant inscrit
```

## Notifications

1. **Formateur crée formation** → Admin notifié
2. **Admin approuve** → Formateur + Étudiants ciblés notifiés
3. **Étudiant s'inscrit** → Admin + Formateur notifiés
4. **Module complété** → Formateur notifié (optionnel)
5. **Formation complétée** → Admin + Formateur notifiés

## Génération AI

```
Étudiant pose questions → Analyse ML
         │
         ├─→ Détecte spécialité (ex: React)
         ├─→ Détecte niveau (ex: AVANCE)
         │
         └─→ Génère formation
             ├─→ Crée Formation avec modules
             ├─→ Assigne à formateur spécialisé
             ├─→ Status = PENDING
             └─→ Notifie Formateur pour validation
```

