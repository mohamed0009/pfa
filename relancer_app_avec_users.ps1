# Script pour creer les utilisateurs de test et relancer l'application
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COACH AI - Relance avec Utilisateurs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration
$dbName = "coach_ai_db"
$dbUser = "postgres"
$dbHost = "localhost"
$dbPort = "5433"
$dbPassword = "ADMIN"

# Arreter les services existants
Write-Host "`n[Arret] Arret des services existants..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -match "java|node|python"} | Where-Object {
    $_.MainWindowTitle -match "Coach|Spring|Angular|FastAPI" -or 
    (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object {$_.LocalPort -in @(8081, 4200, 8000)})
} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 1. Application du script SQL pour les utilisateurs
Write-Host "`n[1/4] Insertion des utilisateurs de test..." -ForegroundColor Yellow
$env:PGPASSWORD = $dbPassword
$sqlFile = "backend\sql\insert_test_users.sql"
if (Test-Path $sqlFile) {
    $sqlOutput = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Utilisateurs de test inseres" -ForegroundColor Green
        $sqlOutput | Select-String -Pattern "admin|trainer|user|etudiant" | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    } else {
        Write-Host "  [!] Avertissements lors de l'insertion:" -ForegroundColor Yellow
        $sqlOutput | Select-String -Pattern "ERROR" | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    }
} else {
    Write-Host "  [!] Fichier SQL non trouve: $sqlFile" -ForegroundColor Yellow
    Write-Host "  Les utilisateurs seront crees par le backend au demarrage" -ForegroundColor Gray
}

# 2. Demarrage du service Python (Modele IA)
Write-Host "`n[2/4] Demarrage du service Python (Modele IA)..." -ForegroundColor Yellow
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonProcess = Start-Process python -ArgumentList "serve_model.py" -PassThru -WindowStyle Normal
    Start-Sleep -Seconds 3
    if ($pythonProcess -and !$pythonProcess.HasExited) {
        Write-Host "  [OK] Service Python demarre (PID: $($pythonProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "  [!] Service Python en cours de demarrage..." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [X] Python n'est pas installe" -ForegroundColor Red
}

# 3. Demarrage du backend Spring Boot
Write-Host "`n[3/4] Demarrage du backend Spring Boot..." -ForegroundColor Yellow
Set-Location backend

if (Get-Command mvn -ErrorAction SilentlyContinue) {
    if (Test-Path "target\coach-ai-backend-1.0.0.jar") {
        Write-Host "  Utilisation du JAR compile..." -ForegroundColor Gray
        $backendProcess = Start-Process java -ArgumentList "-jar", "target\coach-ai-backend-1.0.0.jar" -PassThru -WindowStyle Normal
    } elseif (Test-Path "target\coach-ai-0.0.1-SNAPSHOT.jar") {
        Write-Host "  Utilisation du JAR compile (ancien nom)..." -ForegroundColor Gray
        $backendProcess = Start-Process java -ArgumentList "-jar", "target\coach-ai-0.0.1-SNAPSHOT.jar" -PassThru -WindowStyle Normal
    } else {
        Write-Host "  Compilation et demarrage avec Maven..." -ForegroundColor Gray
        $backendProcess = Start-Process mvn -ArgumentList "spring-boot:run" -PassThru -WindowStyle Normal
    }
    Start-Sleep -Seconds 5
    Set-Location ..
    if ($backendProcess -and !$backendProcess.HasExited) {
        Write-Host "  [OK] Backend demarre (PID: $($backendProcess.Id))" -ForegroundColor Green
        Write-Host "  Le backend va creer/verifier les utilisateurs de test au demarrage" -ForegroundColor Gray
    } else {
        Write-Host "  [!] Backend en cours de demarrage..." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [X] Maven n'est pas installe" -ForegroundColor Red
    Set-Location ..
}

# 4. Demarrage du frontend Angular
Write-Host "`n[4/4] Demarrage du frontend Angular..." -ForegroundColor Yellow
Set-Location coach_ai_frontend

if (Get-Command npm -ErrorAction SilentlyContinue) {
    if (-not (Test-Path "node_modules")) {
        Write-Host "  Installation des dependances npm..." -ForegroundColor Gray
        npm install
    }
    $frontendProcess = Start-Process npm -ArgumentList "start" -PassThru -WindowStyle Normal
    Start-Sleep -Seconds 5
    Set-Location ..
    if ($frontendProcess -and !$frontendProcess.HasExited) {
        Write-Host "  [OK] Frontend demarre (PID: $($frontendProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "  [!] Frontend en cours de demarrage..." -ForegroundColor Yellow
    }
} else {
    Write-Host "  [X] npm n'est pas installe" -ForegroundColor Red
    Set-Location ..
}

# Attendre le demarrage
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Attente du demarrage (20 secondes)..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Start-Sleep -Seconds 20

# Afficher les utilisateurs crees
Write-Host "`n[Verification] Utilisateurs dans la base de donnees:" -ForegroundColor Yellow
$env:PGPASSWORD = $dbPassword
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT email, first_name || ' ' || last_name as nom, role, status FROM users WHERE email LIKE '%@test.com' ORDER BY role, email;" 2>&1 | Select-String -Pattern "admin|trainer|user|etudiant|email" | ForEach-Object { Write-Host "  $_" -ForegroundColor White }

# Verification des services
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Verification des services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nService Python (Port 8000):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  [OK] Actif" -ForegroundColor Green
} catch {
    Write-Host "  [!] Non accessible encore" -ForegroundColor Yellow
}

Write-Host "`nBackend Spring Boot (Port 8081):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/api/auth/test" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  [OK] Actif" -ForegroundColor Green
} catch {
    Write-Host "  [!] Non accessible encore" -ForegroundColor Yellow
}

Write-Host "`nFrontend Angular (Port 4200):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  [OK] Actif" -ForegroundColor Green
} catch {
    Write-Host "  [!] Non accessible encore" -ForegroundColor Yellow
}

# Resume final
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  URLs d'acces:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend:    http://localhost:4200" -ForegroundColor White
Write-Host "Backend API: http://localhost:8081/api" -ForegroundColor White
Write-Host "Modele IA:   http://localhost:8000" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Comptes de test:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADMIN:   admin@test.com / test123" -ForegroundColor Green
Write-Host "FORMATEUR: trainer@test.com / test123" -ForegroundColor Green
Write-Host "ETUDIANT: user@test.com / test123" -ForegroundColor Green
Write-Host "ETUDIANT: etudiant1@test.com / test123" -ForegroundColor Green
Write-Host "ETUDIANT: etudiant2@test.com / test123" -ForegroundColor Green

Write-Host "`nLes services sont en cours d'execution." -ForegroundColor Green
Write-Host "Vous pouvez maintenant vous connecter avec ces comptes pour voir les dashboards." -ForegroundColor Gray

