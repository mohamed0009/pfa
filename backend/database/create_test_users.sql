-- Script SQL pour créer des utilisateurs de test
-- Exécutez ce script dans PostgreSQL si vous voulez créer des utilisateurs manuellement

-- Note: Les mots de passe sont hashés avec BCrypt
-- Mot de passe original: "test123"
-- Hash BCrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- Créer un utilisateur USER
-- Le mot de passe doit être hashé via BCrypt avant insertion
-- Pour simplifier, utilisez plutôt l'endpoint /api/auth/signup

-- Exemple de création via l'API (recommandé):
-- POST http://localhost:8080/api/auth/signup
-- {
--   "email": "user@test.com",
--   "password": "test123",
--   "firstName": "Test",
--   "lastName": "User",
--   "role": "USER"
-- }

-- Si vous voulez insérer directement dans la base (non recommandé car le mot de passe doit être hashé):
-- INSERT INTO users (id, email, password, first_name, last_name, role, status, joined_at)
-- VALUES (
--   gen_random_uuid()::text,
--   'user@test.com',
--   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: test123
--   'Test',
--   'User',
--   'USER',
--   'ACTIVE',
--   NOW()
-- );

-- Vérifier que les utilisateurs existent:
SELECT id, email, first_name, last_name, role, status FROM users;

