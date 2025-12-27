# 💬 Tests Selenium - Scénario Chat

## 📁 Fichiers Créés

### 1. **Page Object : `selenium/pages/chat_page.py`**
Page Object Model pour interagir avec la page de chat IA.

### 2. **Tests : `selenium/tests/test_chat.py`**
Suite de tests pour valider les fonctionnalités du chat.

## 🧪 Tests Créés

### 1. `test_access_chat_page`
- **Objectif** : Vérifier l'accès à la page de chat
- **Scénario** :
  1. Se connecter
  2. Naviguer directement vers `/user/chat`
  3. Vérifier qu'on est sur la page chat
  4. Vérifier que le chat est chargé

### 2. `test_create_new_conversation`
- **Objectif** : Tester la création d'une nouvelle conversation
- **Scénario** :
  1. Accéder à la page chat
  2. Cliquer sur "Nouvelle Conversation"
  3. Remplir le titre
  4. Créer la conversation
  5. Vérifier qu'elle apparaît dans la liste

### 3. `test_send_message_to_ai`
- **Objectif** : Tester l'envoi d'un message à l'IA
- **Scénario** :
  1. Accéder au chat
  2. Créer ou sélectionner une conversation
  3. Saisir un message
  4. Envoyer le message
  5. Vérifier que le message utilisateur est affiché
  6. (Optionnel) Attendre une réponse de l'IA

### 4. `test_chat_ui_elements`
- **Objectif** : Vérifier la présence des éléments UI
- **Scénario** :
  1. Accéder au chat
  2. Vérifier la sidebar des conversations
  3. Vérifier la zone de chat
  4. Vérifier le bouton de nouvelle conversation

### 5. `test_chat_message_input`
- **Objectif** : Tester le champ de saisie
- **Scénario** :
  1. Accéder au chat
  2. Sélectionner une conversation
  3. Vérifier que le champ est présent et activé
  4. Tester la saisie de texte
  5. Vérifier que le texte est bien saisi

### 6. `test_chat_conversation_selection`
- **Objectif** : Tester la sélection d'une conversation
- **Scénario** :
  1. Accéder au chat
  2. Si des conversations existent, en sélectionner une
  3. Vérifier qu'elle est bien sélectionnée

## 🔧 Méthodes Disponibles dans ChatPage

### Navigation
- `is_chat_loaded()` : Vérifier si le chat est chargé
- `click_new_conversation()` : Cliquer sur nouveau conversation
- `create_new_conversation(title)` : Créer une conversation avec titre
- `select_conversation(index)` : Sélectionner une conversation

### Messages
- `send_message(text)` : Envoyer un message
- `get_last_message()` : Obtenir le dernier message
- `get_last_ai_message()` : Obtenir le dernier message IA
- `get_last_user_message()` : Obtenir le dernier message utilisateur
- `wait_for_ai_response(timeout)` : Attendre une réponse IA

### Conversations
- `get_conversations_count()` : Compter les conversations
- `has_conversations()` : Vérifier s'il y a des conversations
- `delete_conversation(index)` : Supprimer une conversation

## 🚀 Exécution des Tests

### Lancer tous les tests de chat
```bash
cd selenium
pytest tests/test_chat.py -v
```

### Lancer un test spécifique
```bash
pytest tests/test_chat.py::TestChat::test_send_message_to_ai -v
```

### Avec rapport HTML
```bash
pytest tests/test_chat.py -v --html=reports/chat_report.html --self-contained-html
```

## 📋 Prérequis

1. **Frontend démarré** sur `http://localhost:4200`
2. **Backend démarré** sur `http://localhost:8081`
3. **Utilisateur de test** configuré dans le backend

## ⚠️ Notes Importantes

- Les tests nécessitent un utilisateur connecté (fixture `logged_in_user`)
- Certains tests peuvent être skippés si le frontend/backend n'est pas accessible
- L'attente de réponse IA peut prendre du temps (timeout configurable)
- Les sélecteurs sont robustes avec plusieurs stratégies de fallback

## 🔍 Sélecteurs Utilisés

### Principaux éléments
- **Sidebar** : `.conversations-sidebar`
- **Messages** : `.message-bubble`, `.message-user`, `.message-ai`
- **Input** : `input.message-input`, `input[name='message']`
- **Bouton Send** : `button.btn-send`, `button[type='submit']`
- **Conversations** : `.conversation-item`

## 📊 Exemple d'Utilisation

```python
from pages.chat_page import ChatPage

# Dans un test
chat_page = ChatPage(driver)

# Créer une conversation
chat_page.create_new_conversation("Ma conversation")

# Envoyer un message
chat_page.send_message("Bonjour IA !")

# Vérifier la réponse
chat_page.wait_for_ai_response(timeout=30)
last_message = chat_page.get_last_ai_message()
assert last_message is not None
```

---

*Document créé le 26 Décembre 2025*

