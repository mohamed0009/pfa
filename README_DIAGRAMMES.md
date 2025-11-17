# 📊 Guide des Diagrammes UML

## Vue d'Ensemble

Ce document contient tous les diagrammes UML du projet **Coach Virtuel Interactif**. Les diagrammes sont au format PlantUML et peuvent être visualisés avec différents outils.

## 📁 Fichiers de Diagrammes

### 1. `DIAGRAMMES_UML.puml`
Fichier principal contenant tous les diagrammes PlantUML :
- Diagramme de cas d'usage (vue globale)
- Diagramme de classes (modèles)
- Diagramme de classes (services)
- Diagramme de classes (providers & UI)
- Diagrammes de séquence (authentification, chat, quiz)
- Architecture en couches
- Modèle de données (relations)

### 2. `CONCEPTION_COMPLETE.md`
Documentation complète de conception avec :
- Description textuelle des cas d'usage
- Diagrammes ASCII
- Spécifications techniques
- Glossaire

## 🛠️ Outils pour Visualiser les Diagrammes

### Option 1: PlantUML Online
1. Aller sur http://www.plantuml.com/plantuml/uml/
2. Copier le contenu d'un diagramme depuis `DIAGRAMMES_UML.puml`
3. Coller dans l'éditeur
4. Le diagramme sera généré automatiquement

### Option 2: VS Code Extension
1. Installer l'extension "PlantUML" dans VS Code
2. Ouvrir `DIAGRAMMES_UML.puml`
3. Utiliser `Alt+D` pour prévisualiser

### Option 3: IntelliJ IDEA / Android Studio
1. Installer le plugin PlantUML
2. Ouvrir le fichier `.puml`
3. Visualiser directement dans l'IDE

### Option 4: PlantUML Server Local
```bash
# Installer Java
# Télécharger plantuml.jar
java -jar plantuml.jar DIAGRAMMES_UML.puml
```

## 📋 Liste des Diagrammes

### Diagrammes de Cas d'Usage
1. **Vue Globale** - Tous les acteurs et leurs cas d'usage
   - Apprenant: 7 cas d'usage
   - Formateur: 4 cas d'usage
   - Administrateur: 3 cas d'usage

### Diagrammes de Classes

#### Modèles de Données
- `UserModel` et `UserRole`
- `LearningModule` et `LearningContent`
- `Quiz` et `Question`
- `ChatMessage` et `MessageType`
- `UserProgress` et `LearningAnalytics`

#### Services
- `AuthService`
- `AICoachService`
- `LearningService`
- `ApiService`
- `StorageService`
- `LoggerService`

#### Présentation
- `UserProvider`
- `LoginScreen`
- `ChatScreen`
- `LearnerDashboard`
- `LearningModulesScreen`

### Diagrammes de Séquence

1. **Authentification (Login)**
   - Flux complet de connexion
   - Interaction entre tous les composants

2. **Chat avec Coach IA**
   - Génération de réponses
   - Sauvegarde de conversation

3. **Génération de Quiz**
   - Création automatique
   - Calcul de score
   - Mise à jour de progression

### Diagrammes d'Architecture

1. **Architecture en Couches**
   - Présentation
   - Domaine
   - Données
   - Infrastructure

2. **Modèle de Données**
   - Relations entre entités
   - Clés primaires/étrangères

## 🔍 Comment Lire les Diagrammes

### Diagrammes de Classes
- **+** = Méthode publique
- **-** = Attribut privé
- **--** = Séparateur
- **-->** = Relation (utilise)
- ***--** = Composition (contient)
- **..>** = Dépendance

### Diagrammes de Séquence
- **->** = Appel de méthode
- **-->** = Retour
- **activate/deactivate** = Activation de composant
- **alt/else** = Conditions alternatives

### Diagrammes de Cas d'Usage
- **Actor** = Acteur (utilisateur)
- **Usecase** = Cas d'usage
- **-->** = Association

## 📝 Notes Importantes

1. **Format PlantUML**: Tous les diagrammes utilisent la syntaxe PlantUML standard
2. **Séparation**: Chaque diagramme commence par `@startuml` et se termine par `@enduml`
3. **Thème**: Utilisation du thème "plain" pour une meilleure lisibilité
4. **Relations**: Les relations entre classes sont explicites et documentées

## 🎯 Utilisation

Ces diagrammes servent à :
- **Documentation**: Comprendre l'architecture du système
- **Communication**: Partager la conception avec l'équipe
- **Maintenance**: Faciliter les modifications futures
- **Onboarding**: Aider les nouveaux développeurs

## 🔄 Mise à Jour

Lors de modifications importantes :
1. Mettre à jour les diagrammes correspondants
2. Vérifier la cohérence avec le code
3. Régénérer les images si nécessaire
4. Mettre à jour cette documentation

---

**Dernière mise à jour:** 2024  
**Version:** 1.0

