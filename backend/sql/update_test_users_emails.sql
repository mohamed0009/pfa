-- Script pour mettre à jour les emails des utilisateurs de test
-- selon le format requis : @etud.com pour USER, @form.com pour TRAINER, @adm.com pour ADMIN

-- Mettre à jour l'email de l'utilisateur USER de test
UPDATE users 
SET email = 'user@etud.com'
WHERE (email = 'user@test.com' OR email = 'user@etud') AND role = 'USER';

-- Mettre à jour l'email du formateur TRAINER de test
UPDATE users 
SET email = 'trainer@form.com'
WHERE (email = 'trainer@test.com' OR email = 'trainer@form') AND role = 'TRAINER';

-- Mettre à jour l'email de l'administrateur ADMIN de test
UPDATE users 
SET email = 'admin@adm.com'
WHERE (email = 'admin@test.com' OR email = 'admin@adm') AND role = 'ADMIN';

-- Mettre à jour l'email de Zaineb
UPDATE users 
SET email = 'zaineb@etud.com'
WHERE (email = 'zaineb@test.com' OR email = 'zaineb@etud') AND role = 'USER';

-- Vérifier les résultats
SELECT 
    id,
    email,
    first_name || ' ' || last_name as full_name,
    role,
    status
FROM users
WHERE email IN ('user@etud.com', 'trainer@form.com', 'admin@adm.com', 'zaineb@etud.com')
ORDER BY role;
