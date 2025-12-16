# Script PowerShell pour réinitialiser la base de données
# Assurez-vous que PostgreSQL est démarré avant d'exécuter ce script

Write-Host "=== Réinitialisation de la base de données ===" -ForegroundColor Cyan
Write-Host ""

# Chemin vers psql (ajustez selon votre installation PostgreSQL)
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

# Si psql n'est pas trouvé, essayez d'autres emplacements communs
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
}
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
}
if (-not (Test-Path $psqlPath)) {
    Write-Host "PostgreSQL n'est pas trouvé. Veuillez installer PostgreSQL ou ajuster le chemin." -ForegroundColor Red
    exit 1
}

Write-Host "Utilisation de: $psqlPath" -ForegroundColor Green
Write-Host ""

# Demander le mot de passe
$password = Read-Host "Entrez le mot de passe PostgreSQL pour l'utilisateur 'postgres'"

# Créer un fichier SQL temporaire avec toutes les commandes
$sqlFile = "$PSScriptRoot\temp_reset.sql"
@"
\c coach_ai_db
SET session_replication_role = 'replica';
DROP TABLE IF EXISTS quiz_answers CASCADE;
DROP TABLE IF EXISTS quiz_options CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS exercise_submissions CASCADE;
DROP TABLE IF EXISTS submission_attachments CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS course_resources CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS formations CASCADE;
DROP TABLE IF EXISTS course_progress CASCADE;
DROP TABLE IF EXISTS module_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS chat_attachments CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS learning_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS course_skills CASCADE;
DROP TABLE IF EXISTS course_objectives CASCADE;
DROP TABLE IF EXISTS course_prerequisites CASCADE;
SET session_replication_role = 'origin';
\q
"@ | Out-File -FilePath $sqlFile -Encoding UTF8

Write-Host "Exécution du script de réinitialisation..." -ForegroundColor Yellow

# Exécuter psql avec le script
$env:PGPASSWORD = $password
& $psqlPath -U postgres -f $sqlFile
$env:PGPASSWORD = $null

# Supprimer le fichier temporaire
Remove-Item $sqlFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== Réinitialisation terminée ===" -ForegroundColor Green
Write-Host "Vous pouvez maintenant redémarrer le backend Spring Boot." -ForegroundColor Green

