-- Script pour préparer la base de données pour les utilisateurs de test
-- Les utilisateurs seront créés par le DataInitializer du backend avec les bons hashs BCrypt
-- Mot de passe pour tous: test123

-- Supprimer les utilisateurs de test existants pour permettre leur recréation
DELETE FROM preferred_content_types WHERE preferences_id IN (
    SELECT preferences_id FROM users WHERE email IN ('admin@test.com', 'trainer@test.com', 'user@test.com', 'etudiant1@test.com', 'etudiant2@test.com', 'zaineb@test.com')
);
DELETE FROM learning_preferences WHERE id IN (
    SELECT preferences_id FROM users WHERE email IN ('admin@test.com', 'trainer@test.com', 'user@test.com', 'etudiant1@test.com', 'etudiant2@test.com', 'zaineb@test.com')
);
DELETE FROM users WHERE email IN ('admin@test.com', 'trainer@test.com', 'user@test.com', 'etudiant1@test.com', 'etudiant2@test.com', 'zaineb@test.com');

-- Note: Les utilisateurs seront créés automatiquement par le DataInitializer du backend
-- au démarrage avec les bons hashs BCrypt. Ce script prépare juste la base de données.
-- 
-- Comptes qui seront créés:
-- - admin@test.com / test123 (ADMIN)
-- - trainer@test.com / test123 (TRAINER)
-- - user@test.com / test123 (USER)
-- - zaineb@test.com / test123 (USER)

