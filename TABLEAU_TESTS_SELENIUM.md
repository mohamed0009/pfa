# 📋 Tableau des Cas de Test Selenium - Projet Coach AI

## Tests d'Authentification

| ID | Scénario de Test | Préconditions | Étapes | Résultat Attendu | Vérification dans Selenium IDE |
|---|------------------|---------------|--------|------------------|--------------------------------|
| 1 | Connexion avec identifiants corrects | Page de connexion chargée, Backend démarré, Utilisateur existant (`idrissi@etud.com` / `test123`) | 1. Saisir 'idrissi@etud.com' dans le champ 'Email'<br>2. Saisir 'test123' dans le champ 'Mot de passe'<br>3. Cliquer sur le bouton 'Se Connecter' | L'utilisateur est redirigé vers le dashboard (`/user/dashboard` ou `/dashboard`) et le dashboard est chargé | `assertText` pour vérifier la présence d'éléments du dashboard ou `assertLocation` pour vérifier l'URL |
| 2 | Connexion avec identifiants incorrects | Page de connexion chargée, Backend démarré | 1. Saisir 'invalid@test.com' dans le champ 'Email'<br>2. Saisir 'wrongpassword' dans le champ 'Mot de passe'<br>3. Cliquer sur le bouton 'Se Connecter' | Un message d'erreur s'affiche indiquant que les identifiants sont incorrects | `assertText` pour vérifier le texte du message d'erreur (`.alert-error` ou `.error-message`) |
| 3 | Connexion avec champ 'Email' vide | Page de connexion chargée | 1. Laisser le champ 'Email' vide<br>2. Saisir 'test123' dans le champ 'Mot de passe'<br>3. Cliquer sur le bouton 'Se Connecter' | Aucune action ou message d'erreur de validation affiché, l'utilisateur reste sur la page de connexion | `verifyAlert` ou `assertText` pour vérifier l'absence de redirection ou la présence d'un message de validation |
| 4 | Connexion avec champ 'Mot de passe' vide | Page de connexion chargée | 1. Saisir 'idrissi@etud.com' dans le champ 'Email'<br>2. Laisser le champ 'Mot de passe' vide<br>3. Cliquer sur le bouton 'Se Connecter' | Aucune action ou message d'erreur de validation affiché, l'utilisateur reste sur la page de connexion | `verifyAlert` ou `assertText` pour vérifier l'absence de redirection ou la présence d'un message de validation |
| 5 | Connexion avec les deux champs vides | Page de connexion chargée | 1. Laisser le champ 'Email' vide<br>2. Laisser le champ 'Mot de passe' vide<br>3. Cliquer sur le bouton 'Se Connecter' | Aucune action ou message d'erreur de validation affiché, l'utilisateur reste sur la page de connexion | `assertText` pour vérifier l'absence de message de succès et `assertLocation` pour vérifier qu'on est toujours sur `/login` |
| 6 | Navigation vers la page d'inscription depuis la page de connexion | Page de connexion chargée | 1. Cliquer sur le lien 'Créer un compte' ou 'S'inscrire' | L'utilisateur est redirigé vers la page d'inscription (`/signup`) | `assertLocation` pour vérifier que l'URL contient `/signup` |

## Tests d'Inscription

| ID | Scénario de Test | Préconditions | Étapes | Résultat Attendu | Vérification dans Selenium IDE |
|---|------------------|---------------|--------|------------------|--------------------------------|
| 7 | Inscription réussie avec données valides | Page d'inscription chargée, Backend démarré | 1. Saisir 'Test User' dans le champ 'Nom complet'<br>2. Sélectionner 'USER' dans le champ 'Rôle'<br>3. Saisir un email valide (format `test@etud.com`) dans le champ 'Email'<br>4. Saisir 'Test1234' dans le champ 'Mot de passe'<br>5. Saisir 'Test1234' dans le champ 'Confirmer mot de passe'<br>6. Cocher la case 'Accepter les conditions'<br>7. Cliquer sur le bouton 'Créer Mon Compte' | Un message de succès s'affiche ou l'utilisateur est redirigé vers la page de connexion (`/login`) | `assertText` pour vérifier le message de succès ou `assertLocation` pour vérifier la redirection vers `/login` |
| 8 | Inscription avec email invalide (ne se termine pas par @etud.com pour rôle USER) | Page d'inscription chargée, Rôle USER sélectionné | 1. Saisir 'Test User' dans le champ 'Nom complet'<br>2. Sélectionner 'USER' dans le champ 'Rôle'<br>3. Saisir 'test@invalid.com' dans le champ 'Email'<br>4. Saisir 'Test1234' dans le champ 'Mot de passe'<br>5. Saisir 'Test1234' dans le champ 'Confirmer mot de passe'<br>6. Cocher la case 'Accepter les conditions'<br>7. Cliquer sur le bouton 'Créer Mon Compte' | Un message d'erreur s'affiche indiquant que l'email n'est pas valide pour le rôle sélectionné | `assertText` pour vérifier le texte du message d'erreur de validation de l'email |
| 9 | Inscription avec mot de passe trop court | Page d'inscription chargée | 1. Saisir 'Test User' dans le champ 'Nom complet'<br>2. Sélectionner 'USER' dans le champ 'Rôle'<br>3. Saisir 'test@etud.com' dans le champ 'Email'<br>4. Saisir 'Test1' (moins de 8 caractères) dans le champ 'Mot de passe'<br>5. Saisir 'Test1' dans le champ 'Confirmer mot de passe'<br>6. Cocher la case 'Accepter les conditions'<br>7. Cliquer sur le bouton 'Créer Mon Compte' | Un message d'erreur s'affiche indiquant que le mot de passe doit contenir au moins 8 caractères | `assertText` pour vérifier le message d'erreur de validation du mot de passe |
| 10 | Inscription avec confirmation de mot de passe différente | Page d'inscription chargée | 1. Saisir 'Test User' dans le champ 'Nom complet'<br>2. Sélectionner 'USER' dans le champ 'Rôle'<br>3. Saisir 'test@etud.com' dans le champ 'Email'<br>4. Saisir 'Test1234' dans le champ 'Mot de passe'<br>5. Saisir 'Test5678' dans le champ 'Confirmer mot de passe'<br>6. Cocher la case 'Accepter les conditions'<br>7. Cliquer sur le bouton 'Créer Mon Compte' | Un message d'erreur s'affiche indiquant que les mots de passe ne correspondent pas | `assertText` pour vérifier le message d'erreur de non-correspondance des mots de passe |
| 11 | Inscription sans accepter les conditions | Page d'inscription chargée | 1. Saisir 'Test User' dans le champ 'Nom complet'<br>2. Sélectionner 'USER' dans le champ 'Rôle'<br>3. Saisir 'test@etud.com' dans le champ 'Email'<br>4. Saisir 'Test1234' dans le champ 'Mot de passe'<br>5. Saisir 'Test1234' dans le champ 'Confirmer mot de passe'<br>6. Ne pas cocher la case 'Accepter les conditions'<br>7. Cliquer sur le bouton 'Créer Mon Compte' | Le bouton est désactivé ou un message d'erreur s'affiche indiquant qu'il faut accepter les conditions | `assertElementPresent` pour vérifier que le bouton est désactivé ou `assertText` pour vérifier le message d'erreur |
| 12 | Navigation vers la page de connexion depuis la page d'inscription | Page d'inscription chargée | 1. Cliquer sur le lien 'Se connecter' ou 'Déjà un compte ?' | L'utilisateur est redirigé vers la page de connexion (`/login`) | `assertLocation` pour vérifier que l'URL contient `/login` |

## Tests de Navigation

| ID | Scénario de Test | Préconditions | Étapes | Résultat Attendu | Vérification dans Selenium IDE |
|---|------------------|---------------|--------|------------------|--------------------------------|
| 13 | Vérification des éléments de la page d'accueil | Page d'accueil chargée (`/`) | 1. Vérifier la présence du header<br>2. Vérifier la présence de la section hero<br>3. Vérifier la présence de la section services<br>4. Vérifier la présence de la section témoignages<br>5. Vérifier la présence du footer | Tous les éléments principaux de la page d'accueil sont présents et visibles | `assertElementPresent` pour chaque élément (header, hero, services, testimonials, footer) |
| 14 | Navigation vers la page de connexion depuis la page d'accueil | Page d'accueil chargée (`/`) | 1. Cliquer sur le bouton 'Se Connecter' dans le header | L'utilisateur est redirigé vers la page de connexion (`/login`) | `assertLocation` pour vérifier que l'URL contient `/login` |
| 15 | Navigation vers la page d'inscription depuis la page d'accueil | Page d'accueil chargée (`/`) | 1. Cliquer sur le bouton 'S'inscrire' dans le header | L'utilisateur est redirigé vers la page d'inscription (`/signup`) | `assertLocation` pour vérifier que l'URL contient `/signup` |

## Tests du Dashboard Utilisateur

| ID | Scénario de Test | Préconditions | Étapes | Résultat Attendu | Vérification dans Selenium IDE |
|---|------------------|---------------|--------|------------------|--------------------------------|
| 16 | Accès au dashboard après connexion réussie | Utilisateur connecté avec succès | 1. Après connexion, vérifier que l'URL contient `/user/dashboard` ou `/dashboard`<br>2. Vérifier la présence des éléments du dashboard | Le dashboard est chargé et affiche les informations de l'utilisateur | `assertLocation` pour vérifier l'URL et `assertElementPresent` pour vérifier les éléments du dashboard |
| 17 | Navigation vers 'Mes Formations' depuis le dashboard | Utilisateur connecté, Dashboard chargé | 1. Cliquer sur le lien ou bouton 'Mes Formations' dans le menu du dashboard | L'utilisateur est redirigé vers la page des formations (`/my-formations` ou `/courses`) | `assertLocation` pour vérifier que l'URL contient `/my-formations` ou `/courses` |
| 18 | Navigation vers 'Profil' depuis le dashboard | Utilisateur connecté, Dashboard chargé | 1. Cliquer sur le lien ou bouton 'Profil' dans le menu du dashboard | L'utilisateur est redirigé vers la page de profil (`/profile`) | `assertLocation` pour vérifier que l'URL contient `/profile` |
| 19 | Déconnexion depuis le dashboard | Utilisateur connecté, Dashboard chargé | 1. Cliquer sur le bouton 'Déconnexion' ou 'Se déconnecter' dans le menu | L'utilisateur est déconnecté et redirigé vers la page d'accueil (`/`) ou la page de connexion (`/login`) | `assertLocation` pour vérifier la redirection vers `/` ou `/login` et `assertText` pour vérifier l'absence des éléments du dashboard |

## Tests de Validation des Formulaires

| ID | Scénario de Test | Préconditions | Étapes | Résultat Attendu | Vérification dans Selenium IDE |
|---|------------------|---------------|--------|------------------|--------------------------------|
| 20 | Validation du formulaire de connexion avec champs vides | Page de connexion chargée | 1. Laisser tous les champs vides<br>2. Tenter de cliquer sur le bouton 'Se Connecter' | Le bouton est désactivé ou un message de validation s'affiche | `assertElementNotEnabled` pour vérifier que le bouton est désactivé ou `assertText` pour vérifier les messages de validation |
| 21 | Validation du formulaire d'inscription avec champs vides | Page d'inscription chargée | 1. Laisser tous les champs vides<br>2. Tenter de cliquer sur le bouton 'Créer Mon Compte' | Le bouton est désactivé ou des messages de validation s'affichent pour chaque champ requis | `assertElementNotEnabled` pour vérifier que le bouton est désactivé ou `assertText` pour vérifier les messages de validation de chaque champ |

---

## 📝 Notes Importantes

### Prérequis pour l'exécution des tests
- **Backend**: Démarré sur `http://localhost:8081`
- **Frontend**: Démarré sur `http://localhost:4200`
- **Base de données**: Contient un utilisateur de test avec les identifiants `idrissi@etud.com` / `test123`

### Commandes Selenium IDE équivalentes

Les vérifications mentionnées dans le tableau peuvent être implémentées avec les commandes suivantes dans Selenium IDE :

- **`assertText`**: Vérifie qu'un élément contient un texte spécifique
  - Exemple: `assertText | css=.error-message | Nom d'utilisateur ou mot de passe incorrect`

- **`assertLocation`**: Vérifie que l'URL actuelle correspond à une valeur attendue
  - Exemple: `assertLocation | */login`

- **`assertElementPresent`**: Vérifie qu'un élément est présent dans le DOM
  - Exemple: `assertElementPresent | css=.dashboard-container`

- **`assertElementNotEnabled`**: Vérifie qu'un élément (bouton) est désactivé
  - Exemple: `assertElementNotEnabled | css=button[type='submit']`

- **`verifyAlert`**: Vérifie la présence d'une alerte
  - Exemple: `verifyAlert | Veuillez remplir tous les champs`

### Structure des Sélecteurs

Les sélecteurs utilisés dans les tests sont basés sur :
- **ID**: `#email`, `#password`
- **CSS Selectors**: `.alert-error`, `button[type='submit']`
- **XPath**: `//a[@routerLink='/signup']`, `//button[contains(text(), 'Se Connecter')]`

---

*Document créé le 25 Décembre 2025*
*Basé sur les tests Selenium existants du projet Coach AI*


