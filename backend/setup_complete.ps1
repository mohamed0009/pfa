# Script PowerShell pour recréer la base de données et démarrer le backend
# Exécutez ce script : .\setup_complete.ps1

Write-Host "=== SETUP COMPLET - COACH AI BACKEND ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$dbName = "coach_ai_db"
$dbUser = "postgres"
$dbPassword = "root"  # Changez si votre mot de passe est différent
$psqlPath = $null

# Chercher psql
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "✅ PostgreSQL trouvé : $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL non trouvé. Veuillez installer PostgreSQL ou ajuster le chemin dans le script." -ForegroundColor Red
    exit 1
}

# Étape 1 : Supprimer et recréer la base de données
Write-Host ""
Write-Host "ÉTAPE 1 : Recréation de la base de données..." -ForegroundColor Yellow

$env:PGPASSWORD = $dbPassword

# Supprimer la base
Write-Host "  Suppression de la base de données $dbName..." -ForegroundColor White
& $psqlPath -U $dbUser -d postgres -c "DROP DATABASE IF EXISTS $dbName;" 2>&1 | Out-Null

# Créer la base
Write-Host "  Création de la base de données $dbName..." -ForegroundColor White
& $psqlPath -U $dbUser -d postgres -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Base de données créée avec succès" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Erreur lors de la création. La base existe peut-être déjà." -ForegroundColor Yellow
}

# Étape 2 : Exécuter le script SQL (optionnel car Spring Boot créera les tables)
Write-Host ""
Write-Host "ÉTAPE 2 : Création des tables..." -ForegroundColor Yellow
Write-Host "  Spring Boot créera automatiquement les tables au démarrage" -ForegroundColor White
Write-Host "  (Vous pouvez ignorer cette étape si vous utilisez ddl-auto=create-drop)" -ForegroundColor Gray

$schemaFile = Join-Path $PSScriptRoot "database\complete_database_schema.sql"
if (Test-Path $schemaFile) {
    Write-Host "  Script SQL trouvé : $schemaFile" -ForegroundColor White
    Write-Host "  Vous pouvez l'exécuter manuellement dans pgAdmin si nécessaire" -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  Script SQL non trouvé, mais Spring Boot créera les tables automatiquement" -ForegroundColor Yellow
}

$env:PGPASSWORD = $null

# Étape 3 : Compiler le projet
Write-Host ""
Write-Host "ÉTAPE 3 : Compilation du projet..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
& mvn clean install -DskipTests -q

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Compilation réussie" -ForegroundColor Green
} else {
    Write-Host "  ❌ Erreur lors de la compilation" -ForegroundColor Red
    exit 1
}

# Étape 4 : Démarrer le backend
Write-Host ""
Write-Host "ÉTAPE 4 : Démarrage du backend..." -ForegroundColor Yellow
Write-Host "  Le backend va créer automatiquement toutes les tables" -ForegroundColor White
Write-Host "  Attendez le message 'Started CoachAiApplication'" -ForegroundColor White
Write-Host ""
Write-Host "  URL : http://localhost:8080" -ForegroundColor Green
Write-Host "  Test : http://localhost:8080/api/auth/test" -ForegroundColor Green
Write-Host ""

& mvn spring-boot:run

