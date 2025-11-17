# 📐 Documentation de Conception Complète
## Coach Virtuel Interactif - Application Flutter

**Version:** 1.0  
**Date:** 2024  
**Auteur:** Analyse Professionnelle d'Ingénierie

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Diagrammes de Cas d'Usage](#diagrammes-de-cas-dusage)
3. [Diagrammes de Classes](#diagrammes-de-classes)
4. [Diagrammes de Séquence](#diagrammes-de-séquence)
5. [Architecture Système](#architecture-système)
6. [Modèle de Données](#modèle-de-données)
7. [Spécifications Techniques](#spécifications-techniques)

---

## 1. Vue d'Ensemble

### 1.1 Description du Système

Le **Coach Virtuel Interactif** est une application mobile d'apprentissage personnalisé qui utilise l'intelligence artificielle pour offrir une expérience d'apprentissage adaptative et interactive.

### 1.2 Acteurs Principaux

- **Apprenant (Learner)**: Utilisateur principal qui suit des modules et interagit avec le coach
- **Formateur (Trainer)**: Supervise les apprenants et gère le contenu pédagogique
- **Administrateur (Admin)**: Gère le système, les utilisateurs et les configurations

### 1.3 Objectifs du Système

1. Fournir un apprentissage personnalisé adapté au niveau de chaque apprenant
2. Offrir un coach virtuel IA pour l'assistance en temps réel
3. Générer automatiquement du contenu pédagogique
4. Suivre et analyser les progrès des apprenants
5. Faciliter la gestion des contenus pour les formateurs

---

## 2. Diagrammes de Cas d'Usage

### 2.1 Vue Globale des Cas d'Usage

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTÈME: Coach Virtuel                        │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                       │
        ▼                     ▼                       ▼
   ┌─────────┐          ┌──────────┐          ┌──────────┐
   │Apprenant│          │Formateur │          │Admin     │
   └─────────┘          └──────────┘          └──────────┘
        │                     │                       │
        │                     │                       │
        ├─────────────────────┼─────────────────────┤
        │                     │                       │
        ▼                     ▼                       ▼
```

### 2.2 Cas d'Usage - Apprenant

#### UC-01: S'authentifier
**Acteur:** Apprenant  
**Préconditions:** Aucune  
**Flux Principal:**
1. L'apprenant ouvre l'application
2. L'apprenant saisit son email et mot de passe
3. Le système vérifie les identifiants
4. Le système redirige vers le tableau de bord apprenant
5. **Postconditions:** L'apprenant est connecté

**Flux Alternatif 3a:** Identifiants incorrects
- 3a.1. Le système affiche un message d'erreur
- 3a.2. Retour à l'étape 2

#### UC-02: S'inscrire
**Acteur:** Apprenant  
**Préconditions:** Aucune  
**Flux Principal:**
1. L'apprenant accède à l'écran d'inscription
2. L'apprenant remplit le formulaire (nom, email, mot de passe, rôle)
3. Le système valide les données
4. Le système crée le compte
5. Le système connecte automatiquement l'apprenant
6. **Postconditions:** Nouveau compte créé et utilisateur connecté

#### UC-03: Consulter les modules d'apprentissage
**Acteur:** Apprenant  
**Préconditions:** Apprenant connecté  
**Flux Principal:**
1. L'apprenant accède à la section "Modules"
2. Le système affiche la liste des modules disponibles
3. L'apprenant peut filtrer par catégorie ou niveau
4. L'apprenant sélectionne un module
5. Le système affiche les détails du module
6. **Postconditions:** Module affiché avec contenu

#### UC-04: Interagir avec le coach virtuel
**Acteur:** Apprenant  
**Préconditions:** Apprenant connecté  
**Flux Principal:**
1. L'apprenant ouvre le chat avec le coach
2. L'apprenant saisit une question
3. Le système envoie la question au service IA
4. Le système génère une réponse contextuelle
5. Le système affiche la réponse dans le chat
6. Le système sauvegarde la conversation
7. **Postconditions:** Conversation sauvegardée dans l'historique

**Extensions:**
- 4a. L'apprenant peut demander une explication supplémentaire
- 4b. L'apprenant peut demander un exemple
- 4c. L'apprenant peut demander une reformulation

#### UC-05: Passer un quiz
**Acteur:** Apprenant  
**Préconditions:** Apprenant connecté, module sélectionné  
**Flux Principal:**
1. L'apprenant demande un quiz pour un module
2. Le système génère un quiz personnalisé
3. L'apprenant répond aux questions
4. Le système évalue les réponses
5. Le système affiche le score et les explications
6. Le système enregistre les résultats
7. **Postconditions:** Progression mise à jour

#### UC-06: Consulter sa progression
**Acteur:** Apprenant  
**Préconditions:** Apprenant connecté  
**Flux Principal:**
1. L'apprenant accède à son tableau de bord
2. Le système affiche les statistiques (modules complétés, score moyen, temps passé)
3. L'apprenant peut consulter les détails par module
4. **Postconditions:** Aucune

#### UC-07: Modifier son profil
**Acteur:** Apprenant  
**Préconditions:** Apprenant connecté  
**Flux Principal:**
1. L'apprenant accède à son profil
2. L'apprenant modifie ses informations (nom, formation, niveau)
3. Le système valide les modifications
4. Le système sauvegarde les modifications
5. **Postconditions:** Profil mis à jour

### 2.3 Cas d'Usage - Formateur

#### UC-08: Superviser les apprenants
**Acteur:** Formateur  
**Préconditions:** Formateur connecté  
**Flux Principal:**
1. Le formateur accède à son tableau de bord
2. Le système affiche la liste des apprenants assignés
3. Le formateur sélectionne un apprenant
4. Le système affiche les statistiques détaillées de l'apprenant
5. **Postconditions:** Aucune

#### UC-09: Créer un module d'apprentissage
**Acteur:** Formateur  
**Préconditions:** Formateur connecté  
**Flux Principal:**
1. Le formateur accède à la gestion des modules
2. Le formateur crée un nouveau module
3. Le formateur remplit les informations (titre, description, niveau, contenu)
4. Le système valide et sauvegarde le module
5. **Postconditions:** Nouveau module disponible

#### UC-10: Analyser les performances
**Acteur:** Formateur  
**Préconditions:** Formateur connecté  
**Flux Principal:**
1. Le formateur accède aux analyses
2. Le système affiche les statistiques globales
3. Le formateur peut filtrer par période, module, ou apprenant
4. Le système génère des rapports visuels
5. **Postconditions:** Aucune

### 2.4 Cas d'Usage - Administrateur

#### UC-11: Gérer les utilisateurs
**Acteur:** Administrateur  
**Préconditions:** Administrateur connecté  
**Flux Principal:**
1. L'administrateur accède à la gestion des utilisateurs
2. Le système affiche la liste des utilisateurs
3. L'administrateur peut créer, modifier, ou supprimer des utilisateurs
4. Le système valide et applique les modifications
5. **Postconditions:** Utilisateurs mis à jour

#### UC-12: Configurer le système
**Acteur:** Administrateur  
**Préconditions:** Administrateur connecté  
**Flux Principal:**
1. L'administrateur accède aux paramètres système
2. L'administrateur modifie les configurations (API, notifications, etc.)
3. Le système sauvegarde les configurations
4. **Postconditions:** Système reconfiguré

---

## 3. Diagrammes de Classes

### 3.1 Vue d'Ensemble du Modèle de Classes

```
┌──────────────────────────────────────────────────────────────────┐
│                         COUCHE DOMAINE                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  UserModel   │         │LearningModule │         │     Quiz     │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ -id: String  │         │ -id: String  │         │ -id: String   │
│ -email: Str  │         │ -title: Str  │         │ -title: Str   │
│ -name: Str   │         │ -desc: Str   │         │ -moduleId: Str│
│ -role: Role  │         │ -level: int  │         │ -questions[]  │
│ -prefs: Map  │         │ -progress    │         │ -score: double│
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   UserProgress       │
                    ├──────────────────────┤
                    │ -userId: String      │
                    │ -moduleId: String    │
                    │ -progress: double    │
                    │ -timeSpent: int      │
                    └──────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      COUCHE SERVICES                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ AuthService  │         │AICoachService│        │LearningService│
├──────────────┤         ├──────────────┤         ├──────────────┤
│ +login()     │         │ +generate()  │         │ +getModules()│
│ +register()  │         │ +generateQuiz│         │ +getProgress()│
│ +logout()    │         │ +generateEx()│         │ +updateProg()│
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │    ApiService        │
                    ├──────────────────────┤
                    │ +get()               │
                    │ +post()              │
                    │ +put()               │
                    │ +delete()            │
                    └──────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│UserProvider  │         │LoginScreen   │         │ChatScreen    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ -currentUser │         │ -formKey     │         │ -messages[]  │
│ +login()     │         │ -emailCtrl   │         │ -sendMsg()   │
│ +logout()    │         │ -pwdCtrl     │         │ -receiveMsg()│
└──────────────┘         └──────────────┘         └──────────────┘
```

### 3.2 Diagramme de Classes Détaillé - Modèles

```
┌─────────────────────────────────────────────────────────────┐
│                        UserModel                            │
├─────────────────────────────────────────────────────────────┤
│ -id: String                                                 │
│ -email: String                                              │
│ -name: String                                               │
│ -formation: String?                                         │
│ -level: String?                                             │
│ -role: UserRole                                             │
│ -preferences: Map<String, dynamic>                          │
│ -createdAt: DateTime                                        │
│ -lastLogin: DateTime?                                        │
├─────────────────────────────────────────────────────────────┤
│ +fromJson(json: Map): UserModel                             │
│ +toJson(): Map<String, dynamic>                             │
│ +copyWith(...): UserModel                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
                    ┌───────────────┐
                    │   UserRole     │
                    ├───────────────┤
                    │ admin          │
                    │ trainer        │
                    │ learner        │
                    └───────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      LearningModule                          │
├─────────────────────────────────────────────────────────────┤
│ -id: String                                                 │
│ -title: String                                              │
│ -description: String                                        │
│ -category: String?                                          │
│ -estimatedDuration: int                                     │
│ -level: int                                                 │
│ -topics: List<String>                                       │
│ -contents: List<LearningContent>                            │
│ -isCompleted: bool                                          │
│ -progress: double?                                          │
│ -createdAt: DateTime                                        │
│ -completedAt: DateTime?                                     │
├─────────────────────────────────────────────────────────────┤
│ +fromJson(json: Map): LearningModule                        │
│ +toJson(): Map<String, dynamic>                            │
│ +getCompletionPercentage(): double                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1..*
                            ▼
            ┌───────────────────────────────┐
            │      LearningContent           │
            ├───────────────────────────────┤
            │ -id: String                    │
            │ -type: ContentType             │
            │ -title: String                 │
            │ -content: String               │
            │ -metadata: Map<String, dynamic>│
            └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                           Quiz                              │
├─────────────────────────────────────────────────────────────┤
│ -id: String                                                 │
│ -title: String                                              │
│ -description: String                                        │
│ -moduleId: String                                           │
│ -questions: List<Question>                                  │
│ -timeLimit: int                                             │
│ -createdAt: DateTime                                        │
│ -isCompleted: bool                                          │
│ -score: double?                                             │
├─────────────────────────────────────────────────────────────┤
│ +fromJson(json: Map): Quiz                                  │
│ +toJson(): Map<String, dynamic>                            │
│ +calculateScore(answers: List<int>): double                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1..*
                            ▼
            ┌───────────────────────────────┐
            │         Question              │
            ├───────────────────────────────┤
            │ -id: String                    │
            │ -question: String              │
            │ -options: List<String>         │
            │ -correctAnswerIndex: int       │
            │ -explanation: String?          │
            └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ChatMessage                            │
├─────────────────────────────────────────────────────────────┤
│ -id: String                                                 │
│ -content: String                                            │
│ -type: MessageType                                          │
│ -timestamp: DateTime                                         │
│ -isGenerating: bool                                         │
├─────────────────────────────────────────────────────────────┤
│ +fromJson(json: Map): ChatMessage                           │
│ +toJson(): Map<String, dynamic>                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
                    ┌───────────────┐
                    │  MessageType   │
                    ├───────────────┤
                    │ user           │
                    │ assistant      │
                    │ system         │
                    └───────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      UserProgress                           │
├─────────────────────────────────────────────────────────────┤
│ -userId: String                                             │
│ -moduleId: String                                           │
│ -progress: double                                           │
│ -startedAt: DateTime?                                       │
│ -completedAt: DateTime?                                      │
│ -timeSpent: int                                             │
│ -performance: Map<String, dynamic>                         │
│ -completedContents: List<String>                           │
├─────────────────────────────────────────────────────────────┤
│ +fromJson(json: Map): UserProgress                          │
│ +toJson(): Map<String, dynamic>                            │
│ +updateProgress(value: double): void                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Diagramme de Classes - Services

```
┌─────────────────────────────────────────────────────────────┐
│                      AuthService                            │
├─────────────────────────────────────────────────────────────┤
│ -storage: StorageService                                     │
│ -apiService: ApiService                                     │
│ -logger: LoggerService                                      │
│ -uuid: Uuid                                                 │
├─────────────────────────────────────────────────────────────┤
│ +login(email: String, password: String): Result<UserModel>   │
│ +register(...): Result<UserModel>                           │
│ +logout(): Future<void>                                     │
│ +getCurrentUser(): Future<UserModel?>                       │
│ +updateProfile(...): Result<UserModel>                     │
│ -_getAllUsers(): Future<List<UserModel>>                    │
│ -_saveAllUsers(users: List<UserModel>): Future<void>        │
└─────────────────────────────────────────────────────────────┘
            │                          │
            │ uses                     │ uses
            ▼                          ▼
┌──────────────────────┐    ┌──────────────────────┐
│  StorageService      │    │   ApiService        │
├──────────────────────┤    ├──────────────────────┤
│ +writeSecure()       │    │ +get<T>()           │
│ +readSecure()        │    │ +post<T>()          │
│ +saveAccessToken()   │    │ +put<T>()           │
│ +getAccessToken()    │    │ +delete<T>()        │
│ +clearTokens()       │    │ +uploadFile<T>()    │
└──────────────────────┘    └──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AICoachService                           │
├─────────────────────────────────────────────────────────────┤
│ -apiService: ApiService                                     │
│ -logger: LoggerService                                      │
├─────────────────────────────────────────────────────────────┤
│ +generateResponse(message: String, context: String?):       │
│     Future<String>                                          │
│ +generateQuiz(topics: List<String>, difficulty: int):       │
│     Future<String>                                          │
│ +generateExercise(topic: String, level: int):               │
│     Future<String>                                          │
│ -_generateExplanationResponse(message: String): String      │
│ -_generateExampleResponse(message: String): String           │
│ -_generateHelpResponse(message: String): String             │
│ -_generateMotivationalResponse(message: String): String      │
│ -_generateGeneralResponse(message: String): String           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    LearningService                          │
├─────────────────────────────────────────────────────────────┤
│ -storage: StorageService                                    │
│ -logger: LoggerService                                      │
│ -uuid: Uuid                                                 │
├─────────────────────────────────────────────────────────────┤
│ +getModules(category?: String, level?: int):              │
│     Future<List<LearningModule>>                            │
│ +getModuleById(id: String): Future<LearningModule>         │
│ +getPersonalizedModules(userId: String):                    │
│     Future<List<LearningModule>>                            │
│ +generateQuiz(moduleId: String, difficulty: int):           │
│     Future<Quiz>                                            │
│ +getUserProgress(userId: String, moduleId: String):        │
│     Future<UserProgress>                                    │
│ +updateProgress(userId: String, moduleId: String,          │
│     progress: double): Future<void>                         │
│ +generateContent(topic: String, type: ContentType):        │
│     Future<List<LearningContent>>                           │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Diagramme de Classes - Providers et UI

```
┌─────────────────────────────────────────────────────────────┐
│                      UserProvider                           │
├─────────────────────────────────────────────────────────────┤
│ -authService: AuthService                                   │
│ -_currentUser: UserModel?                                   │
│ -_isLoading: bool                                           │
│ -_errorMessage: String?                                     │
├─────────────────────────────────────────────────────────────┤
│ +currentUser: UserModel?                                    │
│ +isAuthenticated: bool                                      │
│ +isAdmin: bool                                              │
│ +isTrainer: bool                                            │
│ +isLearner: bool                                            │
│ +isLoading: bool                                            │
│ +errorMessage: String?                                      │
│ +login(email: String, password: String): Future<bool>       │
│ +register(...): Future<bool>                                │
│ +logout(): Future<void>                                     │
│ +updateProfile(...): Future<void>                           │
│ +setUser(user: UserModel): void                             │
│ +clearError(): void                                         │
└─────────────────────────────────────────────────────────────┘
            │
            │ notifies
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    LoginScreen                               │
├─────────────────────────────────────────────────────────────┤
│ -_formKey: GlobalKey<FormState>                             │
│ -_emailController: TextEditingController                   │
│ -_passwordController: TextEditingController                │
│ -_obscurePassword: bool                                     │
│ -_isLoading: bool                                           │
├─────────────────────────────────────────────────────────────┤
│ +build(context: BuildContext): Widget                       │
│ -_handleLogin(): Future<void>                               │
│ -_showErrorSnackbar(message: String): void                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ChatScreen                              │
├─────────────────────────────────────────────────────────────┤
│ -_messages: List<ChatMessage>                                │
│ -_messageController: TextEditingController                  │
│ -_isGenerating: bool                                        │
│ -_aiCoachService: AICoachService                            │
├─────────────────────────────────────────────────────────────┤
│ +build(context: BuildContext): Widget                       │
│ -_sendMessage(): Future<void>                               │
│ -_receiveResponse(message: String): Future<void>            │
│ -_buildMessageBubble(message: ChatMessage): Widget          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Diagrammes de Séquence

### 4.1 Séquence - Authentification (Login)

```
Apprenant    LoginScreen    UserProvider    AuthService    StorageService    ApiService
    │             │              │               │                │               │
    │──saisir────>│              │               │                │               │
    │  email/pwd  │              │               │                │               │
    │             │              │               │                │               │
    │<──valider───│              │               │                │               │
    │             │              │               │                │               │
    │──submit────>│              │               │                │               │
    │             │              │               │                │               │
    │             │──login()───>│               │                │               │
    │             │              │               │                │               │
    │             │              │──login()────>│                │               │
    │             │              │               │                │               │
    │             │              │               │──getUsers()───>│               │
    │             │              │               │                │               │
    │             │              │               │<──users────────│               │
    │             │              │               │                │               │
    │             │              │               │──saveUser()───>│               │
    │             │              │               │                │               │
    │             │              │<──Success─────│                │               │
    │             │              │               │                │               │
    │             │<──true───────│               │                │               │
    │             │              │               │                │               │
    │<──redirect───│              │               │                │               │
    │  dashboard  │              │               │                │               │
```

### 4.2 Séquence - Interaction avec le Coach IA

```
Apprenant    ChatScreen    AICoachService    ApiService    StorageService
    │             │               │                │               │
    │──message───>│               │                │               │
    │  "explain"  │               │                │               │
    │             │               │                │               │
    │             │──generate()──>│                │               │
    │             │               │                │               │
    │             │               │──post()───────>│               │
    │             │               │  to OpenAI      │               │
    │             │               │                │               │
    │             │               │<──response─────│               │
    │             │               │                │               │
    │             │<──response─────│                │               │
    │             │               │                │               │
    │<──display───│               │                │               │
    │  response   │               │                │               │
    │             │               │                │               │
    │             │──save()───────────────────────>│               │
    │             │  conversation  │                │               │
    │             │               │                │               │
```

### 4.3 Séquence - Génération de Quiz

```
Apprenant    LearningScreen    LearningService    AICoachService    ApiService
    │              │                  │                  │               │
    │──request─────>│                  │                  │               │
    │  quiz        │                  │                  │               │
    │              │                  │                  │               │
    │              │──generateQuiz()─>│                  │               │
    │              │                  │                  │               │
    │              │                  │──generateQuiz()──>│               │
    │              │                  │                  │               │
    │              │                  │                  │──post()──────>│
    │              │                  │                  │  to AI API    │
    │              │                  │                  │               │
    │              │                  │                  │<──quiz data───│
    │              │                  │                  │               │
    │              │                  │<──Quiz────────────│               │
    │              │                  │                  │               │
    │              │<──Quiz─────────────│                  │               │
    │              │                  │                  │               │
    │<──display────│                  │                  │               │
    │  quiz        │                  │                  │               │
```

---

## 5. Architecture Système

### 5.1 Architecture en Couches

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Screens │  │ Widgets  │  │Providers │  │  Routes  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      COUCHE DOMAINE                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Models  │  │ Entities │  │ Use Cases│                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      COUCHE DONNÉES                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │Services  │  │Repositories│ │Data Sources│                │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE INFRASTRUCTURE                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   API    │  │ Storage  │  │  Logger  │  │   DI     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Flux de Données

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ Action
       ▼
┌─────────────────┐
│  Presentation   │
│  (Screen/Widget)│
└──────┬──────────┘
       │
       │ calls
       ▼
┌─────────────────┐
│    Provider     │
│  (State Mgmt)   │
└──────┬──────────┘
       │
       │ uses
       ▼
┌─────────────────┐
│    Service      │
│  (Business Log) │
└──────┬──────────┘
       │
       │ uses
       ▼
┌─────────────────┐
│  ApiService     │
│  StorageService │
└──────┬──────────┘
       │
       │ stores/fetches
       ▼
┌─────────────────┐
│  Data Storage   │
│  (Local/Remote) │
└─────────────────┘
```

---

## 6. Modèle de Données

### 6.1 Schéma de Base de Données Conceptuel

```
┌──────────────┐         ┌──────────────┐
│    User      │         │   Module     │
├──────────────┤         ├──────────────┤
│ PK id        │         │ PK id        │
│    email     │         │    title     │
│    name      │         │    desc      │
│    role      │         │    level     │
│    formation │         │    category  │
│    level     │         │    duration  │
│    prefs     │         │    createdAt  │
│    createdAt │         └──────────────┘
└──────┬───────┘                │
       │                        │
       │ 1                      │ 1
       │                        │
       │ N                      │ N
       ▼                        ▼
┌──────────────────────────────────────┐
│         UserProgress                 │
├──────────────────────────────────────┤
│ PK userId (FK -> User)              │
│ PK moduleId (FK -> Module)          │
│    progress                          │
│    timeSpent                         │
│    startedAt                         │
│    completedAt                       │
│    performance                       │
└──────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐
│    Module    │         │     Quiz     │
├──────────────┤         ├──────────────┤
│ PK id        │         │ PK id        │
│    ...       │         │ FK moduleId   │
└──────┬───────┘         │    title     │
       │                 │    questions│
       │ 1                │    score    │
       │                 │    createdAt │
       │ N               └──────────────┘
       ▼
┌──────────────┐
│   Content    │
├──────────────┤
│ PK id        │
│ FK moduleId  │
│    type      │
│    title     │
│    content   │
└──────────────┘

┌──────────────┐
│    User      │
├──────────────┤
│ PK id        │
│    ...       │
└──────┬───────┘
       │
       │ 1
       │
       │ N
       ▼
┌──────────────┐
│ChatMessage   │
├──────────────┤
│ PK id        │
│ FK userId    │
│    content   │
│    type      │
│    timestamp │
└──────────────┘
```

---

## 7. Spécifications Techniques

### 7.1 Technologies Utilisées

- **Framework:** Flutter 3.0+
- **Langage:** Dart 3.0+
- **State Management:** Provider
- **Dependency Injection:** GetIt
- **HTTP Client:** Dio
- **Storage:** SharedPreferences + FlutterSecureStorage
- **Logging:** Logger
- **Routing:** GoRouter

### 7.2 Patterns de Conception

1. **Repository Pattern** (à implémenter)
2. **Dependency Injection** (GetIt)
3. **Provider Pattern** (State Management)
4. **Result Pattern** (Error Handling)
5. **Factory Pattern** (Model creation)

### 7.3 Contraintes et Règles Métier

1. **Authentification:**
   - Email unique par utilisateur
   - Mot de passe minimum 6 caractères
   - Rôles: admin, trainer, learner

2. **Modules:**
   - Niveau de difficulté: 1-5
   - Progression: 0.0 - 1.0
   - Un module peut contenir plusieurs contenus

3. **Quiz:**
   - Généré automatiquement par IA
   - Score calculé en pourcentage
   - Temps limité par défaut: 30 minutes

4. **Chat:**
   - Historique sauvegardé par utilisateur
   - Réponses générées par IA
   - Support multilingue (FR/EN)

---

## 8. Glossaire

- **Apprenant (Learner):** Utilisateur qui suit des modules d'apprentissage
- **Formateur (Trainer):** Utilisateur qui supervise les apprenants
- **Administrateur (Admin):** Utilisateur avec accès complet au système
- **Module:** Unité d'apprentissage contenant du contenu pédagogique
- **Quiz:** Évaluation générée automatiquement
- **Coach Virtuel:** Assistant IA pour l'apprentissage
- **Progression:** Pourcentage de complétion d'un module (0-100%)

---

**Document généré par:** Analyse Professionnelle d'Ingénierie  
**Date:** 2024  
**Version:** 1.0

