# 🔄 Comment Recréer la Base de Données pour les Tests

## Méthode 1 : Via pgAdmin (FACILE)

### Étape 1 : Supprimer l'ancienne base
1. Ouvrez **pgAdmin**
2. Développez **Servers** → **PostgreSQL 18** → **Databases**
3. Clic droit sur `coach_ai_db` → **Delete/Drop**
4. Cochez "Cascade" → Cliquez sur **OK**

### Étape 2 : Créer la nouvelle base
1. Clic droit sur **Databases** → **Create** → **Database**
2. Nom : `coach_ai_db`
3. Owner : `postgres`
4. Cliquez sur **Save**

### Étape 3 : Exécuter le script SQL
1. Clic droit sur `coach_ai_db` → **Query Tool**
2. **File** → **Open** → Sélectionnez `backend/database/complete_database_schema.sql`
3. Cliquez sur **Execute** (▶️) ou appuyez sur **F5**
4. Vous devriez voir "Query returned successfully"

---

## Méthode 2 : Via psql (Terminal)

```powershell
# 1. Se connecter à PostgreSQL
psql -U postgres

# 2. Supprimer la base si elle existe
DROP DATABASE IF EXISTS coach_ai_db;

# 3. Créer la nouvelle base
CREATE DATABASE coach_ai_db;

# 4. Se connecter à la base
\c coach_ai_db

# 5. Exécuter le script (ajustez le chemin selon votre système)
\i C:/Users/FadouaOugas/Desktop/pfa/backend/database/complete_database_schema.sql

# 6. Vérifier que les tables sont créées
\dt

# 7. Quitter
\q
```

---

## Méthode 3 : Laisser Spring Boot créer automatiquement (RECOMMANDÉ)

Avec `ddl-auto=create-drop`, Spring Boot recréera automatiquement toutes les tables au démarrage.

**Avantages :**
- ✅ Pas besoin d'exécuter le script SQL
- ✅ Tables toujours synchronisées avec les modèles Java
- ✅ Utilisateurs de test créés automatiquement

**Pour utiliser cette méthode :**
1. Assurez-vous que la base `coach_ai_db` existe (même vide)
2. Démarrez le backend : `mvn spring-boot:run`
3. Spring Boot créera toutes les tables automatiquement

---

## ✅ Vérification

Après avoir créé la base, vérifiez dans pgAdmin :
- Développez `coach_ai_db` → **Schemas** → **public** → **Tables**
- Vous devriez voir toutes les tables (users, courses, formations, etc.)

