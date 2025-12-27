-- Script pour mettre à jour les emails des utilisateurs existants
-- selon leur rôle : @etud pour USER, @form pour TRAINER, @adm pour ADMIN

-- Mettre à jour les emails des étudiants (USER)
UPDATE users 
SET email = SPLIT_PART(email, '@', 1) || '@etud'
WHERE role = 'USER' 
  AND email NOT LIKE '%@etud';

-- Mettre à jour les emails des formateurs (TRAINER)
UPDATE users 
SET email = SPLIT_PART(email, '@', 1) || '@form'
WHERE role = 'TRAINER' 
  AND email NOT LIKE '%@form';

-- Mettre à jour les emails des administrateurs (ADMIN)
UPDATE users 
SET email = SPLIT_PART(email, '@', 1) || '@adm'
WHERE role = 'ADMIN' 
  AND email NOT LIKE '%@adm';

-- Vérifier les résultats
SELECT 
    role,
    COUNT(*) as total,
    COUNT(CASE WHEN email LIKE '%@etud' THEN 1 END) as etud_count,
    COUNT(CASE WHEN email LIKE '%@form' THEN 1 END) as form_count,
    COUNT(CASE WHEN email LIKE '%@adm' THEN 1 END) as adm_count
FROM users
GROUP BY role
ORDER BY role;

