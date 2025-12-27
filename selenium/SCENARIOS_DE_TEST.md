# 📋 Scénarios de Test Selenium - Coach AI

## Vue d'ensemble
Ce document décrit tous les scénarios de test automatisés pour l'application Coach AI.

## 🎯 Scénarios de Test

### 1. Tests d'Authentification

#### 1.1 Test de Connexion (Login)
- **Objectif**: Vérifier que l'utilisateur peut se connecter avec des identifiants valides
- **Prérequis**: Backend démarré, utilisateur existant dans la base de données
- **Étapes**:
  1. Naviguer vers `/login`
  2. Vérifier que la page de login s'affiche
  3. Remplir le champ email avec `idrissi@etud.com`
  4. Remplir le champ mot de passe avec `test123`
  5. Cliquer sur le bouton "Se Connecter"
  6. Vérifier la redirection vers le dashboard utilisateur
  7. Vérifier que l'utilisateur est connecté

#### 1.2 Test de Connexion Échouée
- **Objectif**: Vérifier la gestion des erreurs lors d'une connexion invalide
- **Étapes**:
  1. Naviguer vers `/login`
  2. Remplir avec des identifiants invalides
  3. Cliquer sur "Se Connecter"
  4. Vérifier l'affichage d'un message d'erreur

#### 1.3 Test d'Inscription (Signup)
- **Objectif**: Vérifier que l'utilisateur peut créer un nouveau compte
- **Étapes**:
  1. Naviguer vers `/signup`
  2. Vérifier que le formulaire d'inscription s'affiche
  3. Remplir le nom complet
  4. Sélectionner le rôle (USER)
  5. Remplir l'email avec format valide (`test@etud.com`)
  6. Remplir le mot de passe (min 8 caractères)
  7. Confirmer le mot de passe
  8. Accepter les conditions
  9. Cliquer sur "Créer Mon Compte"
  10. Vérifier la redirection ou le message de succès

#### 1.4 Test de Validation du Formulaire d'Inscription
- **Objectif**: Vérifier la validation des champs du formulaire
- **Étapes**:
  1. Naviguer vers `/signup`
  2. Tester chaque champ avec des valeurs invalides
  3. Vérifier les messages d'erreur appropriés
  4. Vérifier que le bouton submit est désactivé si le formulaire est invalide

### 2. Tests de Navigation

#### 2.1 Test de Navigation sur la Page d'Accueil
- **Objectif**: Vérifier la navigation et les éléments de la page d'accueil
- **Étapes**:
  1. Naviguer vers `/`
  2. Vérifier la présence du header
  3. Vérifier la présence de la section hero
  4. Vérifier la présence des services
  5. Vérifier la présence des témoignages
  6. Vérifier la présence du footer
  7. Vérifier les liens de navigation

#### 2.2 Test de Navigation vers Login depuis Home
- **Objectif**: Vérifier que les liens de navigation fonctionnent
- **Étapes**:
  1. Naviguer vers `/`
  2. Cliquer sur le lien "Se Connecter" dans le header
  3. Vérifier la redirection vers `/login`

#### 2.3 Test de Navigation vers Signup depuis Login
- **Objectif**: Vérifier le lien vers l'inscription
- **Étapes**:
  1. Naviguer vers `/login`
  2. Cliquer sur "Créer un compte"
  3. Vérifier la redirection vers `/signup`

### 3. Tests du Dashboard Utilisateur

#### 3.1 Test d'Accès au Dashboard Utilisateur
- **Objectif**: Vérifier l'accès au dashboard après connexion
- **Prérequis**: Utilisateur connecté
- **Étapes**:
  1. Se connecter avec un compte utilisateur
  2. Vérifier la redirection vers `/user/dashboard`
  3. Vérifier la présence des éléments du dashboard
  4. Vérifier le menu de navigation utilisateur

#### 3.2 Test de Navigation dans le Dashboard
- **Objectif**: Vérifier la navigation entre les sections du dashboard
- **Prérequis**: Utilisateur connecté
- **Étapes**:
  1. Accéder au dashboard utilisateur
  2. Cliquer sur "Mes Formations"
  3. Vérifier l'affichage de la page des formations
  4. Cliquer sur "Profil"
  5. Vérifier l'affichage du profil utilisateur
  6. Cliquer sur "Chat"
  7. Vérifier l'affichage du chat

### 4. Tests de Gestion du Profil

#### 4.1 Test d'Affichage du Profil
- **Objectif**: Vérifier l'affichage des informations du profil
- **Prérequis**: Utilisateur connecté
- **Étapes**:
  1. Naviguer vers `/user/profile`
  2. Vérifier l'affichage des informations utilisateur
  3. Vérifier la présence du formulaire de modification

#### 4.2 Test de Modification du Profil
- **Objectif**: Vérifier la modification des informations du profil
- **Prérequis**: Utilisateur connecté
- **Étapes**:
  1. Naviguer vers `/user/profile`
  2. Modifier le nom
  3. Cliquer sur "Enregistrer"
  4. Vérifier le message de succès
  5. Vérifier que les modifications sont sauvegardées

### 5. Tests de Catalogue de Formations

#### 5.1 Test d'Affichage du Catalogue
- **Objectif**: Vérifier l'affichage des formations disponibles
- **Prérequis**: Utilisateur connecté
- **Étapes**:
  1. Naviguer vers `/user/courses`
  2. Vérifier l'affichage de la liste des formations
  3. Vérifier la présence des filtres (catégorie, niveau)
  4. Vérifier la présence des boutons d'action

#### 5.2 Test de Détails d'une Formation
- **Objectif**: Vérifier l'affichage des détails d'une formation
- **Prérequis**: Utilisateur connecté
- **Étapes**:
  1. Naviguer vers `/user/courses`
  2. Cliquer sur une formation
  3. Vérifier l'affichage des détails
  4. Vérifier la liste des modules
  5. Vérifier le bouton d'inscription

### 6. Tests de Déconnexion

#### 6.1 Test de Déconnexion
- **Objectif**: Vérifier que l'utilisateur peut se déconnecter
- **Prérequis**: Utilisateur connecté
- **Étapes**:
  1. Se connecter
  2. Cliquer sur le bouton de déconnexion
  3. Vérifier la redirection vers la page d'accueil
  4. Vérifier que l'utilisateur n'est plus connecté

### 7. Tests de Responsive Design

#### 7.1 Test sur Mobile
- **Objectif**: Vérifier l'affichage sur mobile
- **Étapes**:
  1. Redimensionner le navigateur à 375x667 (iPhone)
  2. Naviguer vers différentes pages
  3. Vérifier que tous les éléments sont accessibles
  4. Vérifier que le menu mobile fonctionne

### 8. Tests de Performance

#### 8.1 Test de Temps de Chargement
- **Objectif**: Vérifier les temps de chargement des pages
- **Étapes**:
  1. Mesurer le temps de chargement de chaque page principale
  2. Vérifier que le temps est acceptable (< 3 secondes)

## 📊 Matrice de Couverture

| Fonctionnalité | Scénarios | Priorité | Statut |
|---------------|-----------|----------|--------|
| Authentification | 4 | Haute | ✅ |
| Navigation | 3 | Haute | ✅ |
| Dashboard | 2 | Moyenne | ✅ |
| Profil | 2 | Moyenne | ✅ |
| Formations | 2 | Haute | ✅ |
| Déconnexion | 1 | Haute | ✅ |
| Responsive | 1 | Basse | ✅ |
| Performance | 1 | Basse | ✅ |

## 🔧 Configuration des Tests

- **Navigateur**: Chrome (par défaut), Firefox, Edge
- **Mode**: Headless (optionnel)
- **Timeout**: 10 secondes
- **Base URL**: http://localhost:4200
- **Backend URL**: http://localhost:8081

## 📝 Notes

- Tous les tests nécessitent que le backend soit démarré
- Les tests d'authentification nécessitent un utilisateur de test dans la base de données
- Les tests peuvent être exécutés individuellement ou en suite complète

