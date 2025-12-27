# 📍 Fonctions assertText et assertLocation

## 📂 Emplacement

Les fonctions `assert_text` et `assert_location` se trouvent dans :
```
selenium/pages/base_page.py
```

Elles sont disponibles dans toutes les classes de pages qui héritent de `BasePage` :
- `DashboardPage`
- `LoginPage`
- `SignupPage`
- `HomePage`

## 🔍 Fonction `assert_text`

### **Localisation**
```python
# Fichier: selenium/pages/base_page.py
# Lignes: ~98-115
```

### **Signature**
```python
def assert_text(self, locator, expected_text, timeout=None):
    """
    Vérifier que le texte d'un élément correspond au texte attendu
    
    Args:
        locator: Tuple (By, value) pour localiser l'élément
        expected_text: Texte attendu (peut être une partie du texte)
        timeout: Timeout en secondes (optionnel)
    
    Returns:
        bool: True si le texte correspond
    
    Raises:
        AssertionError: Si le texte ne correspond pas
    """
```

### **Utilisation**

#### Exemple 1 : Vérifier le titre du dashboard
```python
from pages.dashboard_page import DashboardPage

dashboard_page = DashboardPage(driver)

# Vérifier que le titre contient "Dashboard"
dashboard_page.assert_text(
    DashboardPage.DASHBOARD_TITLE,
    "Dashboard"
)
```

#### Exemple 2 : Vérifier un message d'erreur
```python
from pages.login_page import LoginPage

login_page = LoginPage(driver)
login_page.login_with_invalid_credentials()

# Vérifier le message d'erreur
login_page.assert_text(
    LoginPage.ERROR_MESSAGE,
    "Email ou mot de passe incorrect"
)
```

#### Exemple 3 : Avec timeout personnalisé
```python
dashboard_page.assert_text(
    DashboardPage.DASHBOARD_TITLE,
    "Tableau de bord",
    timeout=15  # Attendre 15 secondes
)
```

## 🔍 Fonction `assert_location`

### **Localisation**
```python
# Fichier: selenium/pages/base_page.py
# Lignes: ~117-135
```

### **Signature**
```python
def assert_location(self, expected_url_pattern, timeout=None):
    """
    Vérifier que l'URL actuelle contient le pattern attendu
    
    Args:
        expected_url_pattern: Pattern d'URL à vérifier (peut être une partie de l'URL)
        timeout: Timeout en secondes pour attendre l'URL (optionnel)
    
    Returns:
        bool: True si l'URL correspond
    
    Raises:
        AssertionError: Si l'URL ne correspond pas
    """
```

### **Utilisation**

#### Exemple 1 : Vérifier l'URL du dashboard
```python
from pages.dashboard_page import DashboardPage

dashboard_page = DashboardPage(driver)

# Vérifier qu'on est sur le dashboard
dashboard_page.assert_location("/user/dashboard", timeout=10)
```

#### Exemple 2 : Vérifier après une navigation
```python
# Cliquer sur "Mes Formations"
dashboard_page.click_my_formations()

# Vérifier la redirection
dashboard_page.assert_location("/my-formations", timeout=10)
```

#### Exemple 3 : Vérifier après déconnexion
```python
dashboard_page.click_logout()

# Vérifier qu'on est redirigé vers login
dashboard_page.assert_location("/login", timeout=10)
```

#### Exemple 4 : Pattern partiel
```python
# Vérifier qu'on est dans la section user (peu importe la sous-page)
dashboard_page.assert_location("/user", timeout=10)
```

## 📝 Exemples Complets dans les Tests

### **Fichier : `selenium/tests/test_dashboard.py`**

#### Test avec `assert_text` et `assert_location`
```python
def test_dashboard_access(self, logged_in_user):
    """Test d'accès au dashboard"""
    driver = logged_in_user
    dashboard_page = DashboardPage(driver)
    
    # Vérifier l'URL avec assert_location
    dashboard_page.assert_location("/user", timeout=10)
    
    # Vérifier la présence d'éléments du dashboard avec assert_text
    dashboard_page.assert_text(
        DashboardPage.DASHBOARD_TITLE,
        "Dashboard"
    )
```

#### Test de navigation
```python
def test_dashboard_navigation(self, logged_in_user):
    """Test de navigation dans le dashboard"""
    driver = logged_in_user
    dashboard_page = DashboardPage(driver)
    
    # Vérifier le titre du dashboard
    dashboard_page.assert_text(
        DashboardPage.DASHBOARD_TITLE, 
        "Dashboard"
    )
    
    # Cliquer sur "Mes Formations"
    dashboard_page.click_my_formations()
    
    # Vérifier la redirection avec assert_location
    dashboard_page.assert_location("/my-formations", timeout=10)
```

## 🎯 Avantages de ces Fonctions

### ✅ **Avant (sans les fonctions)**
```python
# Vérification manuelle
element = dashboard_page.find_element(DashboardPage.DASHBOARD_TITLE)
assert "Dashboard" in element.text, f"Texte attendu non trouvé. Texte actuel: {element.text}"

# Vérification URL manuelle
assert "/user/dashboard" in driver.current_url, f"URL attendue non trouvée. URL actuelle: {driver.current_url}"
```

### ✅ **Après (avec les fonctions)**
```python
# Plus simple et lisible
dashboard_page.assert_text(DashboardPage.DASHBOARD_TITLE, "Dashboard")
dashboard_page.assert_location("/user/dashboard", timeout=10)
```

## 🔧 Personnalisation

### **Ajouter des méthodes spécifiques dans DashboardPage**

Vous pouvez créer des méthodes wrapper dans `DashboardPage` :

```python
# Dans selenium/pages/dashboard_page.py

def assert_dashboard_title(self):
    """Vérifier le titre du dashboard"""
    self.assert_text(self.DASHBOARD_TITLE, "Dashboard")

def assert_dashboard_url(self):
    """Vérifier l'URL du dashboard"""
    self.assert_location("/user/dashboard", timeout=10)
```

Puis utiliser simplement :
```python
dashboard_page.assert_dashboard_title()
dashboard_page.assert_dashboard_url()
```

## 📊 Résumé

| Fonction | Fichier | Lignes | Usage |
|----------|---------|--------|-------|
| `assert_text()` | `selenium/pages/base_page.py` | ~98-115 | Vérifier le texte d'un élément |
| `assert_location()` | `selenium/pages/base_page.py` | ~117-135 | Vérifier l'URL actuelle |

## 🚀 Utilisation dans vos Tests

Tous les tests peuvent maintenant utiliser ces fonctions :

```python
# Dans n'importe quel test
from pages.dashboard_page import DashboardPage

dashboard_page = DashboardPage(driver)

# Vérifier le texte
dashboard_page.assert_text(locator, "texte attendu")

# Vérifier l'URL
dashboard_page.assert_location("/pattern/url", timeout=10)
```

---

*Document créé le 25 Décembre 2025*

