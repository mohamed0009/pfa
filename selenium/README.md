# 🧪 Tests Selenium - Coach AI

## 📋 Vue d'ensemble

Cette suite de tests Selenium automatisés pour l'application Coach AI utilise Python, pytest et Selenium WebDriver.

## 🚀 Installation

### Prérequis
- Python 3.8+
- pip
- Chrome/Firefox/Edge installé

### Installation des dépendances

```bash
# Installer les dépendances Python
pip install -r requirements.txt
```

Les drivers de navigateur seront automatiquement téléchargés via `webdriver-manager`.

## ⚙️ Configuration

1. Copier le fichier `.env.example` vers `.env`:
```bash
cp .env.example .env
```

2. Modifier les valeurs dans `.env` selon vos besoins:
```env
BASE_URL=http://localhost:4200
BACKEND_URL=http://localhost:8081
BROWSER=chrome
HEADLESS=false
TEST_USER_EMAIL=idrissi@etud.com
TEST_USER_PASSWORD=test123
```

## 🏃 Exécution des Tests

### Exécuter tous les tests
```bash
python run_tests.py
```

### Exécuter un fichier de test spécifique
```bash
pytest tests/test_authentication.py -v
```

### Exécuter un test spécifique
```bash
pytest tests/test_authentication.py::TestLogin::test_successful_login -v
```

### Exécuter avec options
```bash
# Mode headless
HEADLESS=true pytest tests/ -v

# Navigateur spécifique
BROWSER=firefox pytest tests/ -v

# Avec rapport HTML
pytest tests/ -v --html=reports/report.html --self-contained-html
```

## 📊 Structure des Tests

```
selenium/
├── config.py              # Configuration
├── conftest.py            # Configuration pytest
├── pages/                  # Page Object Model
│   ├── base_page.py
│   ├── home_page.py
│   ├── login_page.py
│   ├── signup_page.py
│   └── dashboard_page.py
├── tests/                  # Tests
│   ├── test_authentication.py
│   ├── test_navigation.py
│   └── test_dashboard.py
├── screenshots/            # Screenshots en cas d'échec
├── reports/                # Rapports de test
└── requirements.txt        # Dépendances
```

## 📝 Scénarios de Test

### Tests d'Authentification
- ✅ Connexion réussie
- ✅ Connexion échouée
- ✅ Validation du formulaire de connexion
- ✅ Navigation vers signup depuis login

### Tests d'Inscription
- ✅ Inscription réussie
- ✅ Validation du formulaire d'inscription
- ✅ Validation de l'email selon le rôle
- ✅ Navigation vers login depuis signup

### Tests de Navigation
- ✅ Éléments de la page d'accueil
- ✅ Navigation vers login depuis home
- ✅ Navigation vers signup depuis home

### Tests du Dashboard
- ✅ Accès au dashboard
- ✅ Navigation dans le dashboard
- ✅ Déconnexion

## 🖼️ Screenshots

Les screenshots sont automatiquement capturés en cas d'échec de test et sauvegardés dans le dossier `screenshots/`.

## 📈 Rapports

Les rapports HTML sont générés dans le dossier `reports/` après chaque exécution.

## 🔧 Dépannage

### Backend non démarré
Assurez-vous que le backend est démarré sur `http://localhost:8081`:
```bash
cd backend
mvn spring-boot:run
```

### Frontend non démarré
Assurez-vous que le frontend est démarré sur `http://localhost:4200`:
```bash
cd coach_ai_frontend
npm start
```

### Erreur de driver
Les drivers sont automatiquement téléchargés. Si vous rencontrez des problèmes, vous pouvez les installer manuellement ou vérifier votre connexion Internet.

## 📚 Documentation

Pour plus de détails sur les scénarios de test, voir [SCENARIOS_DE_TEST.md](SCENARIOS_DE_TEST.md).

## 🤝 Contribution

Pour ajouter de nouveaux tests:
1. Créer une nouvelle page dans `pages/` si nécessaire
2. Créer les tests dans `tests/`
3. Suivre le pattern Page Object Model

