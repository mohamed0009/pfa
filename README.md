# Coach Virtuel Interactif - Application Flutter

Une application d'apprentissage moderne avec un coach virtuel basé sur l'IA, conçue pour offrir une expérience d'apprentissage personnalisée, dynamique et accessible.

## 🎯 Fonctionnalités Principales

### 1. Gestion des Utilisateurs
- ✅ **Authentification sécurisée** : Connexion via email/mot de passe
- ✅ **Inscription avec sélection de rôle** : Administrateur, Formateur, Apprenant
- ✅ **Gestion de profil** : Modification du nom, formation, niveau, préférences
- ✅ **Suivi individuel** : Suivi des activités et progrès de chaque apprenant
- ✅ **Rôles et permissions** :
  - **Administrateur** : Gestion des utilisateurs et contenus
  - **Formateur** : Supervision et suivi des apprenants
  - **Apprenant** : Interaction avec le coach et accès à son parcours

### 2. Interaction avec le Coach Virtuel
- ✅ **Interface de chat intuitive** : Dialogue en langage naturel avec le coach IA
- ✅ **Réponses contextuelles** : Le coach comprend et répond aux questions
- ✅ **Demandes spéciales** : Possibilité de demander des explications, exemples, reformulations
- ✅ **Historique des conversations** : Sauvegarde pour un apprentissage continu
- ✅ **Indicateur de frappe** : Feedback visuel pendant la génération de réponses
- ✅ **Actions rapides** : Boutons pour questions fréquentes

### 3. Personnalisation du Parcours d'Apprentissage
- ✅ **Modules d'apprentissage** : Catalogue organisé par catégories et niveaux
- ✅ **Analyse de performance** : Suivi des réponses, temps de réalisation, progression
- ✅ **Contenu personnalisé** : Proposition selon le niveau et le rythme
- ✅ **Adaptation dynamique** : Parcours adapté selon les résultats
- ✅ **Recommandations** : Suggestions de ressources supplémentaires

### 4. Génération Automatique de Contenu Pédagogique
- ✅ **Exercices auto-générés** : Création automatique par l'IA
- ✅ **Quiz personnalisés** : Génération basée sur le niveau et les besoins
- ✅ **Exemples concrets** : Mises en situation adaptées au domaine
- ✅ **Résumés automatiques** : Synthèse des concepts appris

### 5. Tableaux de Bord et Suivi

#### Tableau de Bord Apprenant
- Vue d'ensemble des statistiques (modules, complétés, en cours, score)
- Actions rapides (chat coach, modules, progression, quiz)
- Activité récente
- Navigation intuitive entre modules, chat et profil

#### Tableau de Bord Formateur
- Statistiques des apprenants (nombre, moyenne, besoins d'aide)
- Gestion des modules
- Suivi des apprenants
- Création de contenu
- Analyses détaillées

#### Tableau de Bord Administrateur
- Vue d'ensemble du système (utilisateurs, formateurs, apprenants, modules)
- Gestion des utilisateurs
- Gestion des contenus
- Paramètres système
- Rapports et analyses

### 6. Accessibilité et Ergonomie
- ✅ **Interface responsive** : Accessible sur ordinateur, tablette et smartphone
- ✅ **Navigation fluide** : Transitions animées entre modules et sessions
- ✅ **Recherche intégrée** : Recherche rapide de ressources ou sujets
- ✅ **Sauvegarde automatique** : Reprise là où l'apprenant s'est arrêté
- ✅ **Design moderne** : UI/UX professionnelle avec animations fluides

### 7. Notifications et Assistance
- ✅ **Système de notifications** : (Prêt pour intégration)
- ✅ **Assistance intégrée** : Support technique et contact formateur
- ✅ **Messages motivationnels** : Conseils personnalisés du coach virtuel

## 🏗️ Architecture

```
lib/
├── core/
│   ├── models/           # Modèles de données
│   │   ├── user_model.dart
│   │   ├── chat_message.dart
│   │   ├── learning_module.dart
│   │   ├── quiz_model.dart
│   │   └── progress_model.dart
│   ├── providers/        # State management (Provider)
│   │   └── user_provider.dart
│   ├── services/         # Services métier
│   │   ├── auth_service.dart
│   │   ├── ai_coach_service.dart
│   │   └── learning_service.dart
│   ├── routes/           # Configuration de navigation
│   │   └── app_routes.dart
│   └── theme/            # Thème et design system
│       └── app_theme.dart
├── features/
│   ├── auth/             # Authentification
│   │   └── presentation/
│   │       ├── login_screen.dart
│   │       └── register_screen.dart
│   ├── splash/           # Écran de démarrage
│   ├── onboarding/       # Introduction
│   ├── chat/             # Chat avec le coach
│   │   └── presentation/
│   │       └── chat_screen.dart
│   ├── learning/         # Modules d'apprentissage
│   │   └── presentation/
│   │       └── learning_modules_screen.dart
│   ├── dashboard/        # Tableaux de bord par rôle
│   │   └── presentation/
│   │       ├── learner_dashboard.dart
│   │       ├── trainer_dashboard.dart
│   │       └── admin_dashboard.dart
│   ├── profile/          # Profil utilisateur
│   └── settings/         # Paramètres
└── widgets/              # Composants réutilisables
    ├── custom_button.dart
    ├── custom_card.dart
    ├── custom_text_field.dart
    └── stat_card.dart
```

## 🚀 Démarrage Rapide

### Prérequis
- Flutter SDK (>=3.0.0)
- Dart SDK
- Android Studio / Xcode (pour le développement mobile)

### Installation

1. **Cloner ou naviguer vers le projet**
   ```bash
   cd pfa
   ```

2. **Installer les dépendances**
   ```bash
   flutter pub get
   ```

3. **Lancer l'application**
   ```bash
   flutter run
   ```

### Comptes de Démonstration

L'application inclut des comptes de démonstration :

- **Administrateur** :
  - Email: `admin@example.com`
  - Mot de passe: (n'importe quel mot de passe)

- **Formateur** :
  - Email: `trainer@example.com`
  - Mot de passe: (n'importe quel mot de passe)

- **Apprenant** :
  - Email: `learner@example.com`
  - Mot de passe: (n'importe quel mot de passe)

Vous pouvez également créer de nouveaux comptes via l'écran d'inscription.

## 🎨 Design System

### Palette de Couleurs
- **Primary** : Indigo (#6366F1)
- **Secondary** : Purple (#8B5CF6)
- **Accent** : Pink (#EC4899)
- **Success** : Green (#10B981)
- **Warning** : Amber (#F59E0B)
- **Error** : Red (#EF4444)

### Typographie
- Police : Inter (Google Fonts)
- Hiérarchie claire avec différentes tailles et poids

### Composants
- Boutons personnalisés avec états de chargement
- Cartes avec effets visuels
- Champs de texte avec validation
- Cartes de statistiques

## 📦 Dépendances Principales

- `provider` - Gestion d'état
- `google_fonts` - Typographie
- `flutter_animate` - Animations fluides
- `shared_preferences` - Stockage local
- `http` - Requêtes réseau (prêt pour API)
- `flutter_local_notifications` - Notifications
- `charts_flutter` - Graphiques (pour analyses futures)

## 🔐 Sécurité et Permissions

### Permissions par Rôle

#### Administrateur
- Gestion complète des utilisateurs
- Gestion des contenus pédagogiques
- Accès aux statistiques système
- Paramètres de configuration

#### Formateur
- Supervision des apprenants
- Suivi des progrès
- Création et modification de contenus
- Analyses des performances

#### Apprenant
- Interaction avec le coach virtuel
- Accès aux modules d'apprentissage
- Suivi de sa propre progression
- Gestion de son profil

## 🎯 Flux Utilisateur

1. **Démarrage** → Splash Screen → Onboarding
2. **Authentification** → Connexion ou Inscription
3. **Tableau de bord** → Redirection selon le rôle
4. **Apprentissage** :
   - Consultation des modules
   - Interaction avec le coach
   - Passage de quiz
   - Suivi de la progression
5. **Profil** → Gestion des informations personnelles

## 🔄 Évolutions Futures

- [ ] Intégration d'un vrai modèle LLM (OpenAI, Anthropic, etc.)
- [ ] Backend API complet
- [ ] Notifications push en temps réel
- [ ] Analyse détaillée avec graphiques
- [ ] Génération de PDF pour rapports
- [ ] Mode hors ligne
- [ ] Synchronisation multi-appareils
- [ ] Chat vidéo avec formateurs
- [ ] Certificats de complétion

## 📝 Notes Techniques

### Services Mock
Les services actuels utilisent des données mockées pour la démonstration :
- `AICoachService` : Génère des réponses simulées
- `AuthService` : Stocke les utilisateurs localement
- `LearningService` : Fournit des modules d'exemple

Pour la production, remplacez ces services par des appels API réels.

### État Global
L'application utilise `Provider` pour la gestion d'état globale. Le `UserProvider` maintient l'état de l'utilisateur connecté.

## 🤝 Contribution

Ce projet est un template complet pour une application de coach virtuel. Pour l'adapter à vos besoins :

1. Remplacez les services mock par vos API
2. Configurez vos clés API pour l'IA
3. Personnalisez les thèmes et couleurs
4. Ajoutez vos propres contenus pédagogiques

## 📄 Licence

Ce projet est fourni à des fins éducatives et de démonstration.

---

**Développé avec ❤️ en Flutter**

